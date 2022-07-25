require('dotenv').config()
const fs = require("fs");
const validator = require("email-validator");
const parseCSV = require('../helpers/parseCsv');
const { cleanEmail, noop } = require('../helpers/getState');

(async function () {

  try {
    console.time(`Measure CleanEmail for ${cleanEmail.targetFileName}`)

    // recreate existing output
    if (fs.existsSync(cleanEmail.targetFileName)) await fs.unlinkSync(cleanEmail.targetFileName)
    await fs.writeFileSync(cleanEmail.outputPath(), '')

    // begin parsing to check index[16] email column
    const rows = await parseCSV(cleanEmail.inputPath())

    for (let row = 0; row < rows.length; row++) {
      const data = rows[row]
      const outputRow = [...data]

      // HEADERS:
      if (row === 0) {
        await fs.appendFile(cleanEmail.outputPath(), `${data.join(",")}\n`, noop)
        continue;
      }

      // CLEAN DATA: normalize everything and enclose inside "" if there is a data
      for (let i in outputRow) outputRow[i] ? outputRow[i] = `"${outputRow[i]}"` : null

      // CLEAN DATA: remove email value if its an invalid email format
      const isEmailValid = validator.validate(outputRow[16]);
      if (!isEmailValid && outputRow[16] !== '') outputRow[16] = ''

      await fs.appendFile(cleanEmail.outputPath(), `${outputRow.join(",")}\n`, noop)
    }

    console.timeEnd(`Measure CleanEmail for ${cleanEmail.targetFileName}`)
  }

  catch (e) {
    console.log('\n[ERROR]: ', e, '\n')
    process.exit()
  }

})()