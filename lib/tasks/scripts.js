'use strict';

var path = require('path'),
    coffee = require('gulp-coffee'),
    sourcemaps = require('gulp-sourcemaps');

module.exports = function(options) {
  function compile(stream) {
    return stream
      .pipe(sourcemaps.init())
      .pipe(coffee({
        bare: true
      }))
      .pipe(sourcemaps.write('maps', {
        includeContent: false,
        sourceRoot: options.paths.scripts.cwd
      }));
  }

  return {
    src: path.join(options.paths.scripts.cwd, options.paths.scripts.glob),
    dest: path.join(options.paths.dest, options.paths.scripts.dest),
    pipe: compile
  };
};
