"use strict";

const GpsdClient = require('./lib/GpsdClient');
const SandGrain = require('sand-grain');

class Gpsd extends SandGrain {

  constructor() {
    super();
    this.name = 'gpsd';
    this.configName = 'gpsd';
    this.defaultConfig = require('./defaultConfig');
    this.version = require('./package').version;
  }

  bindToContext(ctx) {
    let clients = [];
    ctx.gpsd = new GpsdClient(this.config);
    ctx.gpsd.on('client', client => {
      clients.push(client);
    });
    ctx.on('end', () => {
      for (let client of clients) {
        if (client.isConnected()) {
          this.log('disconnecting client...');
          client.disconnect();
        }
      }
    });
  }

}

Gpsd.GpsdClient = GpsdClient;

module.exports = Gpsd;
