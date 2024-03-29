const getters = require('../composition/row');

class Row {
  constructor(data) {
    this.data = [[...data]]
    this.appendTimes = 0
    this._cleanExtraCommas()
    this._cleanValuesWithQuotations()
    this._determineAppendTimes()
  }
  
  _cleanExtraCommas() {
    if (!process.env.remove_extra_commas.toBoolean()) return null

    this.mainData().splice(parseInt(process.env.remove_extra_commas_starting_at_index), this.mainData().length)
  }

  _cleanValuesWithQuotations() {
    for (let i in this.mainData()) this.mainData()[i] ? this.mainData()[i] = `"${this.mainData()[i]}"` : null
  }

  _determineAppendTimes() {
    if (!process.env.append_multiple_times.toBoolean()) return null

    if ((this.getEmails().length - 1) > 0) this.appendTimes = (this.getEmails().length - 1)
  }

  mainData(){
    return this.data[0]
  }

  pushData(...data) {
    this.data.forEach(row => row.push(...data))
  }

  pushRow(data) {
    this.data.push(data)
  }

  toString(delimeter) {
    return this.mainData().join(delimeter)
  }
}

for (const getterMethod of Object.keys(getters)) Row.prototype[getterMethod] = getters[getterMethod]

module.exports = Row;