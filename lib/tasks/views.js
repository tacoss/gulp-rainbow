'use strict';

var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    yaml = require('js-yaml'),
    jade = require('gulp-jade'),
    rename = require('gulp-rename'),
    changed = require('gulp-changed'),
    deepMerge = require('deepmerge');

function push(obj, key, data) {
  var parts = key.split('.');

  while (parts.length > 1) {
    var prop = parts.shift();

    obj = obj[prop] || (obj[prop] = {});
  }

  prop = parts.shift();

  obj[prop] = deepMerge(obj[prop] || {}, data);
}

module.exports = function(options) {
  var src = path.join(options.paths.views.cwd, options.paths.views.glob),
      dest = path.join(options.paths.dest, options.paths.views.dest);

  function compile(stream, onError) {
    var locals = {
      data: options.data || {}
    };

    options.paths.data.src
      .forEach(function(data_src) {
        glob.sync(path.join(data_src, options.paths.data.glob))
          .forEach(function(file) {
            var keypath = path.relative(data_src, file)
              .replace(/[\\\/]/g, '.')
              .replace('.yml', '');

            push(locals.data, keypath, yaml.load(fs.readFileSync(file)));
          });
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
