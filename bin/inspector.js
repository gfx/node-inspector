#!/usr/bin/env node

var dserver = require('../lib/debug-server'),
    fs = require('fs'),
    path = require('path'),
    options = { // default settings
      debugPort: 5858,
      webPort:   8080,
    };

process.argv.forEach(function (arg) {
  var parts;
  if (arg.indexOf('--') > -1) {
    parts = arg.split('=');
    if (parts.length > 1) {
      switch (parts[0]) {
      case '--web-port':
      case '--agent-port':
        options.webPort = parseInt(parts[1], 10);
        break;
      case '--debug-port':
        options.debugPort = parseInt(parts[1], 10);
        break;
      case '--debug-host':
        options.debugHost = parts[1];
        break;
      default:
        console.log('unknown option: ' + parts[0]);
        break;
      }
    }
    else if (parts[0] === '--help') {
      console.log('Usage: node [node_options] debug-agent.js [options]');
      console.log('Options:');
      console.log('--web-port=[port]     port to host the inspector (default %s)', webPort);
      console.log('--debug-port=[port]   port to the debuggee (default %s)',
        options.debugPort);
      console.log('--debug-host=[host]   host to the debuggee (default localhost)',
        options.debugHost);
      process.exit();
    }
  }
});

fs.readFile(path.join(__dirname, '../config.json'), function(err, data) {
  var config;
  if (err) {
    console.warn("could not load config.json\n" + err.toString());
    config = {};
  }
  else {
    config = JSON.parse(data);
    if (config.hidden) {
      config.hidden = config.hidden.map(function(s) {
        return new RegExp(s, 'i');
      });
    }
  }
  if (!config.webPort) {
    config.webPort = options.webPort;
  }
  if (!config.debugPort) {
    config.debugPort = options.debugPort;
  }
  if(!config.debugHost) {
      config.debugHost = options.debugHost;
  }
  dserver.create(options, config).on('close', function () {
    console.log('session closed');
    process.exit();
  });
});
