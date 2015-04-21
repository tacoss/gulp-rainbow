'use strict';

var sourcemaps = require('gulp-sourcemaps');

module.exports = function(stream, callback, relative_dir) {
  return stream
    .pipe(sourcemaps.init())
    .pipe(callback)
    .pipe(sourcemaps.write('maps', {
      includeContent: false,
      sourceRoot: relative_dir
    }));
};
