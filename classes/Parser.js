const fs = require("fs");
const { parse } = require("csv-parse");
const getStream = require('get-stream');

class Parser {
  async csv(filePath, delimeter) {
    if (!delimeter) delimeter = ','

    const parseStream = parse({ delimiter: ',' });
    const data = await getStream.array(fs.createReadStream(filePath).pipe(parseStream));
    return data;
  }
}

module.exports = Parser;