'use strict';

var path = require('path'),
    browserSync = require('browser-sync');

function append(snippet) {
  return snippet;
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
