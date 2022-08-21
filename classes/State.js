const fs = require('fs');
const fsPromise = require('fs/promises');

class State {
  constructor() {
    this.targetFileName = process.env.target_file_name;
    this.inputPath = `./src/${this.targetFileName}`;
    this.outputPath = `./output/OUTPUT-${this.targetFileName}`;
    this.cachedHeadersPath = `./output/CACHED-HEADERS-${this.targetFileName}`;
    this.logPath = `./output/LOGS-${this.targetFileName}.log`;
    this.keyOfActiveBrowser = 1
    this.numOfIgRequests = 0
    this.numOfCurrentRow = 2 // disregarding the header
  }

  incrementNumOfIgRequests() {
    this.numOfIgRequests+=1
  }

  incrementNumOfCurrentRow() {
    this.numOfCurrentRow+=1
  }

  incrementKeyOfActiveBrowser() {
    this.keyOfActiveBrowser == process.env.num_of_windows ? this.keyOfActiveBrowser = 1 : this.keyOfActiveBrowser += 1
  }

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms))
  }

  async cleanOutput() {
    const properties = ['outputPath', 'cachedHeadersPath', 'logPath']

    for (const prop of properties) {
      if (fs.existsSync(this[prop])) await fsPromise.unlink(this[prop])
      await fsPromise.writeFile(this[prop], '')
    }
  }

  async appendOutput(data) {
    await fsPromise.appendFile(this.outputPath, data)
  }

  async appendCachedHeaders(headers) {
    await fsPromise.appendFile(this.cachedHeadersPath, headers)
  }
}

module.exports = State;