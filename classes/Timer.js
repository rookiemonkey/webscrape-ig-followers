class Timer {
  constructor(message) {
    this.message = message
  }

  start() {
    console.time(this.message)
  }

  end() {
    console.timeEnd(this.message)
  }
}

module.exports = Timer;