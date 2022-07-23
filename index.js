require('dotenv').config()
const fs = require("fs");
const puppeteer = require('puppeteer');
const { parse } = require("csv-parse");
const getStream = require('get-stream');

let currentRow = 2 // disregarding the headers
const added_headers = 'ig_followers,email,remarks'
const targetFileName = 'shopgram-report-first-100.csv';
const outputPath = `./output/${targetFileName}`;
const inputPath = `./src/${targetFileName}`
const noop = () => { }

async function parseCSV(filePath) {
  const parseStream = parse({ delimiter: ',' });
  const data = await getStream.array(fs.createReadStream(filePath).pipe(parseStream));
  return data;
}

(async function(){

  try {
    console.time(`Measure IG-Webscraper for ${targetFileName}`)

    // initialize the browser, set headless to false to see how it works
    const browser = await puppeteer.launch({ headless: false, args: ['--incognito'] });
    const page = await browser.newPage();

    // Configure the navigation timeout
    await page.setDefaultNavigationTimeout(0);

    // login any account first since it redirects to login page always if not logged in
    // NOTE: if you have 2-factor authentication please turn it off for the meantime
    await page.goto('https://www.instagram.com/accounts/login/');

    await page.waitForSelector('[name=username]')
    await page.waitForSelector('[name=password]')

    await page.type('[name=username]', process.env.ig_username);
    await page.type('[name=password]', process.env.ig_password);
    await page.click('[type=submit]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // recreate existing output
    if (fs.existsSync(targetFileName)) await fs.unlinkSync(targetFileName)
    await fs.writeFileSync(outputPath, '')

    // begin parsing
    const rows = await parseCSV(inputPath)

    for(let row = 0; row < rows.length; row++) {
      const data = rows[row]
      const outputRow = [...data]
      const categories = data[6]
      const igUrl = data[7]
      const emails = data[14].split(' ')

      let appendTimes = 0
      let ig_followers = 'NO IG URL'
      let remarks = 'NO MATCHING CATEGORY'

      // HEADERS: removes the exess commas at the end
      if(row === 0) {
        data.splice(15, outputRow.length)
        await fs.appendFile(outputPath, `${data.join(",")},${added_headers}\n`, noop)
        continue;
      }


      // CLEAN DATA: normalize everything and enclose inside "" if there is a data
      for (let i in outputRow) outputRow[i] ? outputRow[i] = `"${outputRow[i]}"` : null

      // CLEAN DATA: converting the raw excel file to csv generated bunch of commas at the end after the emails (index 14) column, removed it
      outputRow.splice(15, outputRow.length)

      // APPEND MULTIPLE TIMES: determine nth times to append on file
      if ((emails.length-1) > 0) appendTimes = (emails.length-1)



      /**
       * IG FOLLOWERS
       * DETERMINE IG FOLLOWERS COUNT: if there is an IG URL
       * redirect to target instagram account and wait until page has been loaded
       * extract the followers count by dom manipulation
       */
      if (igUrl) {
        await page.waitForTimeout(5000)
        await page.goto(igUrl, { waitUntil: 'networkidle0' });

        ig_followers = await page.evaluate(() => {
          const el = [...document.querySelectorAll('div')].filter(el => (el.innerHTML.includes('followers') && el.innerText.length <= 35))[0]
          return el ? parseInt(el.querySelector('span').title.replaceAll(',', '')) : 'INVALID IG URL'
        })
      }

      // apppend the data, added an empty string for the email will be determined before appending
      outputRow.push(ig_followers, '')



      /**
       * REMARKS
       */
      const searchKeys = ['Shirt', 'Hoodie', 'Sweater', 'Blanket']

      for (let searchKey of searchKeys) {
        if (categories.includes(searchKey)) {
          remarks === 'NO MATCHING CATEGORY' ? remarks = '' : null;
          remarks += `${searchKey} `
        }
      }

      // apppend the data
      outputRow.push(remarks)



      /**
       * EMAILS
       */
      for (let count = 0; count <= appendTimes; count++) {
        outputRow[16] = emails[count]
        await fs.appendFile(outputPath, `${outputRow.join(",")}\n`, noop)
      }



      /**
       * OUTPUT THE PROGRESS
       */
      console.log(`[DONE]: ${currentRow} of ${(rows.length)}`)
      currentRow +=1
    }

    console.timeEnd(`Measure IG-Webscraper for ${targetFileName}`)
  }

  catch(e) {
    const stopMessage = `STOPPED @ ROW ${currentRow} of ${targetFileName}`;
    await fs.appendFile(outputPath, stopMessage, noop)
    console.log(`\n[ERROR]: ${stopMessage}\n`)
    console.log('[ERROR]: ', e, '\n')
  }

})()