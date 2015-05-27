'use strict';

var path = require('path'),
    rimraf = require('rimraf');

module.exports = function(options) {
  return function(done) {
    for (var key in options.paths) {
      var opts = options.paths[key];

      if (typeof opts.dest === 'string') {
        rimraf.sync(path.join(options.paths.dest, opts.ext ? opts.dest + '/**/*' + opts.ext : opts.dest));
      }
    }

    done();
  };
};
