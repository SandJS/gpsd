"use strict";

const _ = require('lodash');
const EventEmitter = require('events').EventEmitter
const GpsdListener = require('node-gpsd').Listener;

class GpsdClient extends EventEmitter {

  constructor(opts) {
    super();
    this.opts = opts;
  }

  singleFix() {
    return getSingle.call(this, 'TPV');
  }

  singleSky() {
    return getSingle.call(this, 'SKY');
  }

  listener() {
    return new Promise((resolve, reject) => {
      let opts = _.merge({}, this.opts);
      let client = new GpsdListener(opts);
      this.emit('client', client);
      client.on('error', reject);
      client.connect(function() {
        client.watch();
      });

      resolve(client);
    });
  }

  fixUntil(timeout) {
    return new Promise((resolve, reject) => {
      let results = [];
      this.listener().then(client => {
        client.on('error', reject);
        client.on('TPV', data => results.push(data));
        setTimeout(() => {
          client.disconnect();
          resolve(results);
        }, timeout);
      });
    });
  }

  fixNumber(numToCollect, timeout) {
    return new Promise((resolve, reject) => {
      let results = [];
      this.listener().then(client => {
        client.on('error', reject);
        client.on('TPV', data => {
          results.push(data);
          if (results.length >= numToCollect) {
            client.disconnect();
            resolve(results);
          }
        });

        if (timeout) {
          setTimeout(() => {
            client.disconnect();
            resolve(results);
          }, timeout);
        }
      });
    });
  }

}

module.exports = GpsdClient;

function getSingle(eventName) {
  return new Promise((resolve, reject) => {
    let opts = _.merge({}, this.opts);
    let client = new GpsdListener(opts);
    this.emit('client', client);

    client.on('error', function(err) {
      client.disconnect();
      reject(err);
    });

    client.on(eventName, function(data) {
      client.disconnect();
      resolve(data);
    });

    client.connect(function() {
      client.watch();
    });
  });
}
