require('dotenv').config()
require('./composition/strings');

const State = require('./classes/State');
const LogFile = require('./classes/LogFile');
const Windows = require('./classes/Windows');
const Device = require('./classes/Device');
const Timer = require('./classes/Timer');
const Parser = require('./classes/Parser');
const Row = require('./classes/Row');
const Column = require('./classes/Column');
const IgClient = require('./classes/IgClient');


const state = new State();
const igClient = new IgClient();
const device = new Device();
const logFile = new LogFile(state.logPath);
const windows = new Windows(state, logFile);
const parser = new Parser();
const timer = new Timer(`Measure IG-Webscraper for ${state.targetFileName}`);

(async function(){

  try {
    timer.start();

    // initialize browsers
    await windows.initializeBrowsers();

    // initialize ig mobile
    await igClient.initialize();

    // initialize user agent strings
    await device.initialize();

    // recreate existing output/logs
    await state.cleanOutput();

    // begin parsing
    const rows = await parser.csv(state.inputPath, ',')

    for(let row = 0; row < rows.length; row++) {
      const data = rows[row]
      const rowData = new Row(data)
      const isHeader = row === 0 ? true : false

      // append to output right away if header
      if (isHeader) {
        const headers = `${rowData.toString()},`
        await state.appendOutput(headers);
        await state.appendCachedHeaders(headers)
        continue;
      }

      //  create the coloumn and add the respective data
      const addedHeaders = process.env.added_headers.split(',')

      for (let headerIndex = 0; headerIndex < addedHeaders.length; headerIndex++) {
        const headerName = addedHeaders[headerIndex]
        const isLastColumn = headerIndex === addedHeaders.length-1 ? true : false
        const column = new Column(rowData, state, windows, igClient, headerName, isLastColumn, device)
        await column.addHeader()
        await column.addRowData()
      }

      // append to output based on appendTimes & rowCount on the nested array rowData.data
      for (let rowCount = 0; rowCount <= rowData.appendTimes; rowCount++) await state.appendOutput(`${rowData.data[rowCount]}\n`)

      // ouput the progress
      let numOfIgRequestsSummary = `${state.numOfIgRequests} IG HTTP Requests`
      await logFile.log(`[DONE]: ${state.numOfCurrentRow} of ${(rows.length)} | ${numOfIgRequestsSummary} | ${rowData.getName()}\n`, null)

      state.incrementNumOfCurrentRow();
    }

    timer.end();
    process.exit();
  }

  catch(e) {
    await logFile.log(`STOPPED @ ROW ${state.numOfCurrentRow} of ${state.targetFileName}`, e)
    process.exit()
  }

})()