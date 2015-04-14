'use strict';

var path = require('path'),
    rimraf = require('rimraf');

module.exports = function(options) {
  return function(done) {
    for (var key in options.paths) {
      var dest_dir = options.paths[key].dest;

      if (dest_dir) {
        rimraf.sync(path.join(options.paths.dest, dest_dir));
      }
    }

    done();
  };
};
