'use strict';

var path = require('path'),
    browserSync = require('browser-sync');

module.exports = function(options) {
  var config = {
    files: [path.join(options.paths.dest, '**/*.*')],
    open: options.env.open === true,
    injectChanges: true,
    logConnections: false,
    logSnippet: false,
    logLevel: 'info',
    ghostMode: false,
    watchTask: true,
    online: false,
    notify: true
  };

  if (options.proxy) {
    config.proxy = options.proxy;
  } else {
    config.server = options.paths.dest;
  }

  return function(done) {
    browserSync(config, done);
  };
};
