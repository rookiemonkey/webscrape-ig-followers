require('dotenv').config()
const fs = require("fs");
const emailValidator = require("email-validator");
const parseCSV = require('./helpers/parseCsv');
const getPageAndRetry = require('./helpers/getPageAndRetry');
const getAccountPage = require('./helpers/getAccountPage');
const labels = require('./helpers/getLabels');
const state = require('./helpers/getState');

(async function(){

  try {
    console.time(`Measure IG-Webscraper for ${state.targetFileName}`)

    const windows = {}

    for (let i = 1; i <= process.env.num_of_windows; i++) windows[i] = await getAccountPage(null, null, false)

    // recreate existing output/logs
    if (fs.existsSync(state.outputPath)) await fs.unlinkSync(state.outputPath)
    if (fs.existsSync(state.logPath)) await fs.unlinkSync(state.logPath)
    await fs.writeFileSync(state.outputPath, '')
    await fs.writeFileSync(state.logPath, '')

    // begin parsing
    const rows = await parseCSV(state.inputPath)

    for(let row = 0; row < rows.length; row++) {
      const data = rows[row]
      const outputRow = [...data]
      const name = data[0]
      const categories = data[6]
      const igUrl = data[7]
      const emails = data[14].split(' ')

      let appendTimes = 0
      let ig_followers = 'NO IG URL'
      let remarks = labels.no_matching_category

      // HEADERS: removes the exess commas at the end
      if(row === 0) {
        data.splice(15, outputRow.length)
        await fs.appendFile(state.outputPath, `${data.join(",")},${state.added_headers}\n`, state.noop)
        continue;
      }


      // CLEAN DATA: normalize everything and enclose inside "" if there is a data
      for (let i in outputRow) outputRow[i] ? outputRow[i] = `"${outputRow[i]}"` : null

      // CLEAN DATA: converting the raw excel file to csv generated bunch of commas at the end after the emails (index 14) column, removed it
      outputRow.splice(15, outputRow.length)

      // APPEND MULTIPLE TIMES: determine nth times to append on file
      if ((emails.length-1) > 0) appendTimes = (emails.length-1)




      /**
       * DETERMINE REMARKS: append later
       */
      const searchKeys = ['Shirt', 'Hoodie', 'Sweater', 'Blanket']

      for (let searchKey of searchKeys) {
        if (categories.includes(searchKey)) {
          remarks === labels.no_matching_category ? remarks = '' : null;
          remarks += `${searchKey} `
        }
      }




      /**
       * DETERMINE IG FOLLOWERS COUNT: if there is an IG URL
       * redirect to target instagram account and wait until page has been loaded
       * extract the followers count by dom manipulation
       */
      if (igUrl) {
        const page = windows[state.usingIgAccount]

        await page.waitForTimeout(2500)
        await getPageAndRetry(page, igUrl);

        ig_followers = await page.evaluate(() => {
          const el = [...document.querySelectorAll('div')].filter(el => (el.innerHTML.includes('followers') && el.innerText.length <= 35))[0]
          return el ? parseInt(el.querySelector('span').title.replaceAll(',', '')) : 'INVALID IG URL'
        })

        state.usingIgAccount == process.env.num_of_windows ? state.usingIgAccount = 1 : state.usingIgAccount += 1
        state.numOfIgRequests+=1
      }

      // apppend the data, added an empty string for the email will be determined before appending
      outputRow.push(ig_followers, '', remarks)




      /**
       * EMAILS
       */
      for (let count = 0; count <= appendTimes; count++) {
        const isEmailValid = emailValidator.validate(emails[count].replace(/"/g, ''));
        if (isEmailValid) outputRow[16] = emails[count]

        await fs.appendFile(state.outputPath, `${outputRow.join(",")}\n`, state.noop)
      }




      /**
       * OUTPUT THE PROGRESS
       */
      let numOfIgRequestsSummary = `${state.numOfIgRequests} IG HTTP Requests has been made so far`
      if (ig_followers === 'INVALID IG URL') numOfIgRequestsSummary += ` [ERROR: ${labels.invalid_ig_url}] ${igUrl}`

      const logMessage = `[DONE]: ${state.currentRow} of ${(rows.length)} | ${name} | ${numOfIgRequestsSummary}`
      await fs.appendFile(state.logPath, `${logMessage}\n`, state.noop)
      console.log(logMessage)
      state.currentRow +=1
    }

    console.timeEnd(`Measure IG-Webscraper for ${state.targetFileName}`)
    process.exit()
  }

  catch(e) {
    const stopMessage = `STOPPED @ ROW ${state.currentRow} of ${state.targetFileName}`;
    await fs.appendFile(state.outputPath, stopMessage, state.noop)
    console.log(`\n[ERROR]: ${stopMessage}\n`)
    console.log('[ERROR]: ', e, '\n')
    process.exit()
  }

})()