'use strict';

var path = require('path'),
    bower = require('gulp-bower');

module.exports = function(options) {
  return function() {
    return bower({
      cwd: options.paths.bower
    });
  };
};
