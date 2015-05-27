'use strict';

var path = require('path'),
    changed = require('gulp-changed');

module.exports = function(options, target) {
  var src = path.join(options.paths[target].cwd, options.paths[target].glob),
      dest = path.join(options.paths.dest, options.paths[target].dest);

  function ifChanged(stream, onError) {
    return stream.pipe(changed(dest)).on('error', onError);
  }

  return {
    src: src,
    dest: dest,
    check: ifChanged
  };
};
