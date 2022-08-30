require('dotenv').config()
require('./composition/strings');

const State = require('./classes/State');
const LogFile = require('./classes/LogFile');
const Parser = require('./classes/Parser');
const Row = require('./classes/Row');

const state = new State();
const logFile = new LogFile(state.logPath);
const parser = new Parser();

(async function () {

  try {

    const rows = await parser.csv(state.inputPath, ',')

    let row = 0
    let outputFile = 1

    while (row <= (rows.length - 1)) {
      const data = rows[row]
      const rowData = new Row(data)
      const isHeader = row === 0 ? true : false
      const rawData = `${rowData.toString()}\n`

      // clean file then append headers
      if (isHeader) {
        for (let file = 1; file <= process.env.split_into_num_files.toInt(); file++) {
          const outputName = `${file}.csv`
          await state.cleanToOutput(outputName);
          await state.appendtoOutput(outputName, rawData);
        }

        row++; continue;
      }

      await state.appendtoOutput(`${outputFile}.csv`, rawData);

      row++; outputFile++;
      outputFile === (process.env.split_into_num_files.toInt() + 1) ? outputFile = 1 : null
    }
  }

  catch (e) {
    await logFile.log(`STOPPED @ ROW ${state.numOfCurrentRow} of ${state.targetFileName}`, e)
    process.exit()
  }

})()