const puppeteer = require('puppeteer');
const getIgFollowers = require('../puppeteer/getIgFollowers')

class Windows {
  constructor(state, logFile) {
    this.state = state;
    this.logFile = logFile;
    this.windows = {}
    this.numOfWindows = parseInt(process.env.num_of_windows);
    this.delay = parseInt(process.env.delay);
    this.headless = process.env.headless.toBoolean();
    this.maxRetries = parseInt(process.env.max_retries)
    this.retries = 0
    this.activePage = null
    this.messageOnMaxRetries = process.env.max_retries_error
  }

  resetRetries() {
    this.retries = 0
  }

  async initializeBrowser() {
    if (!process.env.initialize_browser_windows.toBoolean()) return null

    const browser = await puppeteer.launch({ headless: this.headless });
    const context = await browser.createIncognitoBrowserContext();
    return await context.newPage();
  }

  async initializeBrowsers() {
    for (let i = 1; i <= this.numOfWindows; i++) this.windows[i] = await this.initializeBrowser()
  }

  async goToAndRetry(url) {
    try {
      this.activePage = this.windows[this.state.keyOfActiveBrowser]
      await this.activePage.waitForTimeout(this.delay)
      await this.activePage.goto(url, { waitUntil: 'networkidle0' })
    }
    catch (e) {
      if (this.retries >= this.maxRetries) throw new Error(this.messageOnMaxRetries)

      this.retries+=1
      await this.logFile.log(`RETRYING ${this.retries} of ${this.maxRetries}`, e)
      this.goToAndRetry(url)
    }
  }

  async evaluateIgUrl(igUrl) {
    try {
      await this.goToAndRetry(igUrl)

      this.resetRetries()
      return await this.activePage.evaluate(getIgFollowers)
    }

    catch (e) {
      if (e.message === this.messageOnMaxRetries) return this.resetRetries();
      await this.evaluateIgUrl(igUrl)
    }
  }
}

module.exports = Windows;