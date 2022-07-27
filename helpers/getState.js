const added_headers = 'ig_followers,email,remarks'
const targetFileName = process.env.target_file_name;
const logPath = `./output/LOGS-${targetFileName}.log`
const outputPath = `./output/OUTPUT-${targetFileName}`;
const inputPath = `./src/${targetFileName}`
const noop = () => { }

const cleanEmail = {
  targetFileName: process.env.target_file_name_for_email_cleaning,
  outputPath: () => (`./output/OUTPUT-CLEAN-EMAIL-${cleanEmail.targetFileName}`),
  inputPath: () => (`./src/${cleanEmail.targetFileName}`)
}

let usingIgAccount = 1
let numOfIgRequests = 0
let currentRow = 2 // disregarding the headers

module.exports = {
  added_headers,
  targetFileName,
  logPath,
  outputPath,
  inputPath,
  noop,
  usingIgAccount,
  numOfIgRequests,
  currentRow,
  cleanEmail
}