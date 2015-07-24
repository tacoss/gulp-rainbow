'use strict';

var path = require('path'),
    jade = require('gulp-jade'),
    rename = require('gulp-rename'),
    changed = require('gulp-changed');

var getData = require('../utils/data');

module.exports = function(options) {
  var src = path.join(options.paths.views.cwd, options.paths.views.glob),
      dest = path.join(options.paths.dest, options.paths.views.dest);

  function compile(stream, onError) {
    var locals = {
      data: options.data || {}
    };

    options.paths.data.src
      .forEach(function(data_src) {
        var data = getData(data_src);

        for (var key in data) {
          locals.data[key] = data[key];
        }
      });

    for (var fn in options.locals) {
      locals[fn] = options.locals[fn];
    }

    return stream.pipe(jade({
      pretty: true,
      locals: locals,
      basedir: process.cwd()
    }).on('error', onError))
    .pipe(rename(function(file) {
      if (options.paths.views.ext !== '.html') {
        file.extname = options.paths.views.ext;
      }
    }));
  }

  function ifChanged(stream, onError) {
    return stream.pipe(changed(dest, {
      extension: options.paths.views.ext
    })).on('error', onError);
  }

  return {
    src: src,
    dest: dest,
    pipe: compile,
    check: ifChanged
  };
};
