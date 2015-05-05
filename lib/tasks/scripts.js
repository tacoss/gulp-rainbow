'use strict';

var source = require('../source');

var path = require('path'),
    coffee = require('gulp-coffee');

module.exports = function(options) {
  function compile(stream, onError) {
    var run = coffee({
      bare: true
    }).on('error', onError);

    if (options.build || options.debug !== true) {
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
