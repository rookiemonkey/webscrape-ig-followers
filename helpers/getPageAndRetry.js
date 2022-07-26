module.exports = async function getPageAndRetry(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle0' })
  }
  catch(e) {
    console.log(e)
    console.log(`\nRETRYING....\n`)
    await getPageAndRetry(page, url)
  }
}