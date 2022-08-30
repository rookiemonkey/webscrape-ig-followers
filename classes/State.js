const fs = require('fs');
const fsPromise = require('fs/promises');

class State {
  constructor() {
    this.targetFileName = process.env.target_file_name;
    this.inputPath = `./src/${this.targetFileName}`;
    this.outputPath = `./${process.env.output_dir}/OUTPUT-${this.targetFileName}`;
    this.cachedHeadersPath = `./${process.env.output_dir}/CACHED-HEADERS-${this.targetFileName}`;
    this.logPath = `./${process.env.output_dir}/LOGS-${this.targetFileName}.log`;
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

  async appendtoOutput(filename, data) {
    await fsPromise.appendFile(`./${process.env.output_dir}/${filename}`, data)
  }

  async cleanToOutput(filename) {
    if (fs.existsSync(`./${process.env.output_dir}/${filename}`)) await fsPromise.unlink(`./${process.env.output_dir}/${filename}`)
    await fsPromise.writeFile(`./${process.env.output_dir}/${filename}`, '')
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