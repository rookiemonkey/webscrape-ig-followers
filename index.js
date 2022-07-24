require('dotenv').config()
const fs = require("fs");
const parseCSV = require('./helpers/parseCsv');
const getAccountPage = require('./helpers/getAccountPage');
const labels = require('./helpers/getLabels');
const state = require('./helpers/getState');

(async function(){

  try {
    console.time(`Measure IG-Webscraper for ${state.targetFileName}`)

    // spawn account pages
    const accountOnePage = await getAccountPage(process.env.ig_username_one, process.env.ig_password_one)
    const accountTwoPage = await getAccountPage(process.env.ig_username_two, process.env.ig_password_two)

    // recreate existing output
    if (fs.existsSync(state.targetFileName)) await fs.unlinkSync(state.targetFileName)
    await fs.writeFileSync(state.outputPath, '')

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
       * DETERMINE IG FOLLOWERS COUNT: if there is an IG URL and if there is a matching category
       * redirect to target instagram account and wait until page has been loaded
       * extract the followers count by dom manipulation
       */
      if (remarks !== labels.no_matching_category && igUrl) {
        const page = state.usingIgAccount === 1 ? accountOnePage : accountTwoPage

        await page.waitForTimeout(20000)
        await page.goto(igUrl, { waitUntil: 'networkidle0' });

        ig_followers = await page.evaluate(() => {
          const el = [...document.querySelectorAll('div')].filter(el => (el.innerHTML.includes('followers') && el.innerText.length <= 35))[0]
          return el ? parseInt(el.querySelector('span').title.replaceAll(',', '')) : labels.invalid_ig_url
        })

        if (state.usingIgAccount === 1) {
          state.numOfIgRequests['1'] += 1
          state.usingIgAccount = 2
        }

        else {
          state.numOfIgRequests['2'] += 1
          state.usingIgAccount = 1
        }
      }

      if (remarks === labels.no_matching_category) ig_followers = `DID NOT CHECK FOLLOWERS (REASON: ${labels.no_matching_category})`

      // apppend the data, added an empty string for the email will be determined before appending
      outputRow.push(ig_followers, '', remarks)




      /**
       * EMAILS
       */
      for (let count = 0; count <= appendTimes; count++) {
        outputRow[16] = emails[count]
        await fs.appendFile(state.outputPath, `${outputRow.join(",")}\n`, state.noop)
      }




      /**
       * OUTPUT THE PROGRESS
       */
      let numOfIgRequestsSummary = `${state.numOfIgRequests['1']}-${state.numOfIgRequests['2']} IG HTTP Requests has been made so far`
      if (ig_followers === 'INVALID IG URL') numOfIgRequestsSummary += ` [ERROR: ${labels.invalid_ig_url}] ${igUrl}`

      console.log(`[DONE]: ${state.currentRow} of ${(rows.length)} | ${name} | ${numOfIgRequestsSummary}`)
      state.currentRow +=1
    }

    console.timeEnd(`Measure IG-Webscraper for ${state.targetFileName}`)
  }

  catch(e) {
    const stopMessage = `STOPPED @ ROW ${state.currentRow} of ${state.targetFileName}`;
    await fs.appendFile(state.outputPath, stopMessage, state.noop)
    console.log(`\n[ERROR]: ${stopMessage}\n`)
    console.log('[ERROR]: ', e, '\n')
  }

})()