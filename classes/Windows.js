const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const puppeteer = require('puppeteer-extra');
const puppeteer_stealth = require('puppeteer-extra-plugin-stealth');
const puppeteer_proxy = require('puppeteer-page-proxy')
const exec = require('child_process').exec
const getIgFollowers = require('../puppeteer/getIgFollowers')
const isOnLoginPageHandler = require('../puppeteer/isOnLoginPage');
const isOnUnavailablePageHandler = require('../puppeteer/isOnUnavailablePage');

puppeteer.use(puppeteer_stealth())

function changeIpAddress() {
  exec('echo Nivek0987654321 | sudo /etc/init.d/tor restart') // change ip
  console.log("IP CHANGED!")
}

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

    const browser = await puppeteer.launch({ 
      headless: this.headless, 
      args: ['--no-sandbox', '--disable-web-security', '--ignore-certificate-errors', '--proxy-server=socks5://localhost:9050'],
    });
    const page = (await browser.pages())[0];
    // await puppeteer_proxy(page, 'socks://127.0.0.1:9050');
    // github existing issue w/ PR https://github.com/Cuadrix/puppeteer-page-proxy/pull/79
    return page;
  }

  async initializeBrowsers() {
    changeIpAddress()
    for (let i = 1; i <= this.numOfWindows; i++) this.windows[i] = await this.initializeBrowser()
  }

  async goToAndRetry(url) {
    try {
      console.log("[goToAndRetry] TRY")
      let formattedUrl = url.replace('hl=', '') // make sure everything is in english
      this.activePage = this.windows[this.state.keyOfActiveBrowser]
      await this.activePage.goto(formattedUrl, { waitUntil: 'networkidle2' })
      await this.activePage.waitForXPath("//*[text() = ' followers']", { timeout: 10000 })
      return true
    }
    catch (e) {
      console.log("[goToAndRetry] CATCH")
      changeIpAddress()
      if (this.retries >= this.maxRetries) throw new Error(this.messageOnMaxRetries)

      this.retries += 1
      await this.logFile.log(`RETRYING ${this.retries} of ${this.maxRetries}`, e)
      await this.state.sleep(5000)
      await this.activePage.goToAndRetry(url)
    }
  }

  async evaluateIgUrl(igUrl) {
    try {
      console.log("[evaluateIgUrl] TRY")
      await this.goToAndRetry(igUrl)
      return await this.activePage.evaluate(getIgFollowers)
    }

    catch (e) {
      console.log("[evaluateIgUrl] CATCH")
      if (e.message === this.messageOnMaxRetries) return this.messageOnMaxRetries;
      await this.evaluateIgUrl(igUrl)
    }
  }

  async evaluateIgUrlJson(igUrl) {
    try {
      await this.goToAndRetry(igUrl)

      this.resetRetries()
      return await this.activePage.evaluate(getIgFollowersJson)
    }

    catch (e) {
      if (e.message === this.messageOnMaxRetries) return this.resetRetries();
      await this.evaluateIgUrl(igUrl)
    }
  }
}

module.exports = Windows;