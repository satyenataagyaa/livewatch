/**
 * Main application file
 */

'use strict';

var isUseHTTPs = true;
// var isUseHTTPs = !(!!process.env.PORT || !!process.env.IP);

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var config = require('./config/environment');
var path = require('path');
var fs = require('fs');

// Setup server
var app = express();

var server;
if (isUseHTTPs) {
  var options = {
      key: fs.readFileSync(path.join(__dirname, 'fake-keys/privatekey.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'fake-keys/certificate.pem'))
  };
  server = require('https').createServer(options, app);
} else {
  server = require('http').createServer(app);
}

require('./config/express')(app);
require('./routes')(app);

// Start server
server.listen(config.port, config.ip, function () {
  console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;
