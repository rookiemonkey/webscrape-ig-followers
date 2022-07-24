const added_headers = 'ig_followers,email,remarks'
const targetFileName = process.env.target_file_name;
const outputPath = `./output/output-${targetFileName}`;
const inputPath = `./src/${targetFileName}`
const noop = () => { }

let usingIgAccount = 1
let numOfIgRequests = { '1': 0, '2': 0 }
let currentRow = 2 // disregarding the headers

module.exports = {
  added_headers,
  targetFileName,
  outputPath,
  inputPath,
  noop,
  usingIgAccount,
  numOfIgRequests,
  currentRow
}