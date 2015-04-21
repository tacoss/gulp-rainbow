'use strict';

var source = require('../source');

var path = require('path'),
    coffee = require('gulp-coffee');

module.exports = function(options) {
  function compile(stream) {
    var run = coffee({
      bare: true
    });

    if (options.build) {
      return stream.pipe(run);
    }

    return source(stream, run, options.paths.scripts.cwd);
  }

  return {
    src: path.join(options.paths.scripts.cwd, options.paths.scripts.glob),
    dest: path.join(options.paths.dest, options.paths.scripts.dest),
    pipe: compile
  };
};
