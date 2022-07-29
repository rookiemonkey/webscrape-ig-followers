const fs = require('fs');
const fsPromise = require('fs/promises');

class State {
  constructor() {
    this.addedHeaders = process.env.added_headers;
    this.targetFileName = process.env.target_file_name;
    this.inputPath = `./src/${this.targetFileName}`;
    this.outputPath = `./output/OUTPUT-${this.targetFileName}`;
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

  async cleanOutput() {
    if (fs.existsSync(this.outputPath)) await fsPromise.unlink(this.outputPath)
    if (fs.existsSync(this.logPath)) await fsPromise.unlink(this.logPath)

    await fsPromise.writeFile(this.outputPath, '')
    await fsPromise.writeFile(this.logPath, '')
  }

  async appendOutput(data) {
    await fsPromise.appendFile(this.outputPath, data)
  }
}

module.exports = State;