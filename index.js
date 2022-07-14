require('dotenv').config()
const puppeteer = require('puppeteer');

(async function(){

  try {
    // initialize the browser, set headless to false to see how it works
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // login any account first since it redirects to login page always if not logged in
    // NOTE: if you have 2-factor authentication please turn it off for the meantime
    await page.goto('https://www.instagram.com/accounts/login/');

    await page.waitForSelector('[name=username]')
    await page.waitForSelector('[name=password]')

    await page.type('[name=username]', process.env.ig_username);
    await page.type('[name=password]', process.env.ig_password);
    await page.click('[type=submit]');

    // wait for full page load
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // redirect to target instagram account and wait until page has been loaded
    const targetInstagramAccount = 'https://www.instagram.com/mileycyrus'
    await page.goto(targetInstagramAccount, { waitUntil: 'networkidle0'});

    // extract the followers count by dom manipulation
    const followersCount = await page.evaluate(() => {
      const el = [...document.querySelectorAll('div')].filter(el => (el.innerHTML.includes('followers') && el.innerText.length <= 35))[0]
      return parseInt(el.querySelector('span').title.replaceAll(',', ''))
    })

    console.log(`${targetInstagramAccount} has ${followersCount}`)
  }

  catch(e) {
    console.log('ERROR: ', e)
  }

})()