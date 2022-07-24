const puppeteer = require('puppeteer');

module.exports = async function getAccountPage(igUsername, igPassword, login) {
  // initialize the browser, set headless to false to see how it works
  const browser = await puppeteer.launch({ headless: false });
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();

  if (!login) return page

  // Configure the navigation timeout
  await page.setDefaultNavigationTimeout(0);

  // login any account first since it redirects to login page always if not logged in
  // NOTE: if you have 2-factor authentication please turn it off for the meantime
  await page.goto('https://www.instagram.com/accounts/login/');

  await page.waitForSelector('[name=username]')
  await page.waitForSelector('[name=password]')

  await page.type('[name=username]', igUsername);
  await page.type('[name=password]', igPassword);
  await page.click('[type=submit]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });

  return page
}