const addDataMethods = require('../composition/column');
const Parser = require('./Parser');
const parser = new Parser();

class Column {
  constructor(rowData, state, windows, header, isLastColumn) {
    this.rowData = rowData
    this.state = state
    this.windows = windows
    this.header = header
    this.isLastColumn = isLastColumn
  }

  async addHeader() {
    const cachedHeaders = await parser.csv(this.state.cachedHeadersPath, ',')
    if (cachedHeaders[0].includes(this.header)) return null

    let headerString = `"${this.header}"`
    this.isLastColumn ? headerString += `\n` : headerString +=`,`

    await this.state.appendOutput(headerString)
    await this.state.appendCachedHeaders(headerString)
  }

  async getColumnIndex() {
    const cachedHeaders = await parser.csv(this.state.cachedHeadersPath, ',')
    return cachedHeaders[0].indexOf(this.header)
  }

  async addRowData() {
    await this[`add_data_for_${this.header}`]()
  }
}

for (const addDataMethod of Object.keys(addDataMethods)) Column.prototype[addDataMethod] = addDataMethods[addDataMethod]

module.exports = Column;