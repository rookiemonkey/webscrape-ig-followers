const fsPromises = require("fs/promises");

class Device {
  constructor() {
    this.devices = null  
  }

  async initialize(){
    const buffer = await fsPromises.readFile('devices.txt');
    this.devices = buffer.toString().split('\n');
    return this;
  }

  getUserAgentString() {
    return this.devices[Math.floor(Math.random() * this.devices.length)]
  }
}

module.exports = Device