'use strict';

let pm2 = require('pm2');

let instances = process.env.WEB_CONCURRENCY || -1; // Set by Heroku or -1 to scale to max cpu core -1
let maxMemory = process.env.WEB_MEMORY || 512;    // " " "

pm2.connect(() => {
  pm2.start({
    script    : 'dist/server.js',
    name      : 'production-jobflow',
    exec_mode : 'cluster',                  // ----> https://github.com/Unitech/PM2/blob/master/ADVANCED_README.md#schema
    instances : instances,
    max_memory_restart : maxMemory + 'M',   // Auto restart if process taking more than XXmo
    env: {                                  // If needed declare some environment variables
      "NODE_ENV": "production",
    },
  }, (err) => {
    if (err) {
      return console.error('Error while launching applications', err.stack || err);
    }
    console.log('PM2 and application has been succesfully started');

    // Display logs in standard output
    pm2.launchBus(function(err, bus) {
      console.log('[PM2] Log streaming started');

      bus.on('log:out', function(packet) {
       console.log('[App:%s] %s', packet.process.name, packet.data);
      });

      bus.on('log:err', function(packet) {
        console.error('[App:%s][Err] %s', packet.process.name, packet.data);
      });
    });
  });
})
