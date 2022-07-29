require('dotenv').config()
require('./composition/strings');

const State = require('./classes/State');
const LogFile = require('./classes/LogFile');
const Windows = require('./classes/Windows');
const Timer = require('./classes/Timer');
const Parser = require('./classes/Parser');

const state = new State();
const logFile = new LogFile(state.logPath);
const windows = new Windows(state, logFile);
const timer = new Timer(`Measure IG-Webscraper for ${state.targetFileName}`);
const parser = new Parser();

(async function(){

  try {
    timer.start();

    // initialize browsers
    await windows.initializeBrowsers();

    // recreate existing output/logs
    await state.cleanOutput();

    // begin parsing
    const rows = await parser.csv(state.inputPath, ',')

    for(let row = 0; row < rows.length; row++) {
      const data = rows[row]

      // converting the raw excel file to csv generated bunch of commas 
      // at the end after the emails (index 14) column, removed all of it
      data.splice(15, data.length)

      const outputRow = [...data]
      const name = data[0]
      const categories = data[6]
      const igUrl = data[7]
      const emails = data[14].split(' ')

      const defaultRemarks = 'NO MATCHING CATEGORY'
      const defaultIgUrl = 'NO IG URL'

      let appendTimes = 0
      let igFollowers = defaultIgUrl
      let remarks = defaultRemarks

      // HEADERS: 
      if(row === 0) {
        await state.appendOutput(`${data.join(",")},${state.addedHeaders}\n`)
        continue;
      }

      /**
       * CLEAN DATA: normalize everything and enclose inside "" if there is a data
       */
      for (let i in outputRow) outputRow[i] ? outputRow[i] = `"${outputRow[i]}"` : null

      /**
       * DETERMINE nth TIME TO APPEND: basis is emails
       */
      if ((emails.length - 1) > 0) appendTimes = (emails.length - 1)



      /**
       * DETERMINE REMARKS: append later
       */
      const searchKeys = ['Shirt', 'Hoodie', 'Sweater', 'Blanket']

      for (let searchKey of searchKeys) {
        if (categories.includes(searchKey)) {
          remarks === defaultRemarks ? remarks = '' : null;
          remarks += `${searchKey} `
        }
      }




      /**
       * DETERMINE IG FOLLOWERS COUNT: if there is an IG URL
       * redirect to target instagram account and wait until page has been loaded
       * extract the followers count by dom manipulation
       */
      if (igUrl) {
        igFollowers = await windows.evaluateIgUrl(igUrl, false);
        
        if (!igFollowers) igFollowers = process.env.max_retries_error;
        state.incrementKeyOfActiveBrowser();
        state.incrementNumOfIgRequests();
      }

      // apppend the data, added an empty string for the email will be determined before appending
      outputRow.push(igFollowers, '', remarks)




      /**
       * EMAILS
       */
      for (let count = 0; count <= appendTimes; count++) {
        const isEmail = emails[count].replace(/"/g, '').isEmail()
        if (isEmail) outputRow[16] = emails[count]
        
        await state.appendOutput(`${outputRow.join(",")}\n`)
      }




      /**
       * OUTPUT THE PROGRESS
       */
      let numOfIgRequestsSummary = `${state.numOfIgRequests} IG HTTP Requests has been made so far`
      if (igFollowers === 'INVALID IG URL') numOfIgRequestsSummary += ` [ERROR: INVALID IG URL] ${igUrl}`

      await logFile.log(`[DONE]: ${state.numOfCurrentRow} of ${(rows.length)} | ${name} | ${numOfIgRequestsSummary}`, null)

      state.incrementNumOfCurrentRow();
    }

    timer.end();
    process.exit();
  }

  catch(e) {
    await logFile.log(`STOPPED @ ROW ${state.numOfCurrentRow} of ${state.targetFileName}`, e)
    process.exit()
  }

})()