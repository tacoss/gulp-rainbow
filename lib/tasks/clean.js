'use strict';

var rimraf = require('rimraf');

module.exports = function(options) {
  return function(done) {
    rimraf.sync(options.paths.dest);
    done();
  };
};
