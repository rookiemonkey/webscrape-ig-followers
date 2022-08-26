const fsPromise = require('fs/promises');

class LogFile {
  constructor(path) {
    this.path = path;
    this.enabled = process.env.enable_logger.toBoolean();
  }

  async log(message, error) {
    let logMessage = ''

    if (!error) logMessage = `${message}`
    if (error) logMessage = `${message} - ${error.message}`

    console.log(logMessage)
    if (error) console.log(error)

    if (this.enabled) await fsPromise.appendFile(this.path, `${logMessage}\n`)
  }
}

module.exports = LogFile;