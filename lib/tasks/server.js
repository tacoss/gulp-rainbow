'use strict';

var path = require('path'),
    util = require('gulp-util'),
    browserSync = require('browser-sync');

function append(snippet) {
  return snippet;
}

function numpad(value) {
  return value < 10 ? '0' + value : value;
}

function ctime() {
  var now = new Date(),
      time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(numpad).join(':');

  return '[' + util.colors.gray(time) + '] ';
}

module.exports = function(options) {
  var config = {
    files: [path.join(options.paths.dest, '**/*.*')],
    port: typeof options.env.port === 'number' ? options.env.port : 3000,
    open: options.env.open === true,
    snippetOptions: {
      rule: { match: /$/, fn: append }
    },
    injectChanges: true,
    logFileChanges: false,
    logConnections: false,
    logSnippet: false,
    logLevel: 'info',
    logPrefix: ctime,
    ghostMode: false,
    watchTask: true,
    online: false,
    notify: true
  };

  if (options.proxy) {
    config.proxy = options.proxy;
  } else {
    config.server = {
      baseDir: options.paths.dest,
      directory: true
    };
  }

  return function(done) {
    browserSync(config, done);
  };
};
