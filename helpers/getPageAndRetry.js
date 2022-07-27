const state = require('./getState');

module.exports = async function getPageAndRetry(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle0' })
  }
  catch(e) {
    await fs.appendFile(state.logPath, `${e.message}\n`, state.noop)
    console.log(e.message)
    console.log(`\nRETRYING....\n`)
    await getPageAndRetry(page, url)
  }
}