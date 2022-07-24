const fs = require("fs");
const { parse } = require("csv-parse");
const getStream = require('get-stream');

module.exports = async function parseCSV(filePath) {
  const parseStream = parse({ delimiter: ',' });
  const data = await getStream.array(fs.createReadStream(filePath).pipe(parseStream));
  return data;
}
