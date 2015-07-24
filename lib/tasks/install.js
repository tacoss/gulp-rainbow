'use strict';

var bower = require('gulp-bower');

module.exports = function(options) {
  return function() {
    return bower({
      cwd: options.paths.bower
    });
  };
};
