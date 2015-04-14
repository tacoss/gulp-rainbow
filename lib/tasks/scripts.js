'use strict';

var path = require('path'),
    coffee = require('gulp-coffee');

module.exports = function(options) {
  function compile() {
    return coffee({
      bare: true
    });
  }

  return {
    src: path.join(options.paths.scripts.cwd, options.paths.scripts.glob),
    dest: path.join(options.paths.dest, options.paths.scripts.dest),
    pipe: compile
  };
};
