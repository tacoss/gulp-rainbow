'use strict';

var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    yaml = require('js-yaml'),
    jade = require('gulp-jade'),
    rename = require('gulp-rename'),
    changed = require('gulp-changed');

module.exports = function(options) {
  var src = path.join(options.paths.views.cwd, options.paths.views.glob),
      dest = path.join(options.paths.dest, options.paths.views.dest);

  function compile(stream, onError) {
    var locals = {
      data: {}
    };

    glob.sync(path.join(options.paths.data.cwd, options.paths.data.glob)).forEach(function(file) {
      locals.data[path.basename(file).replace('.yml', '')] = yaml.load(fs.readFileSync(file));
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
