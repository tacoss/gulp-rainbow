'use strict';

var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    yaml = require('js-yaml'),
    jade = require('gulp-jade');

module.exports = function(options) {
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
    }).on('error', onError));
  }

  return {
    src: path.join(options.paths.views.cwd, options.paths.views.glob),
    dest: path.join(options.paths.dest, options.paths.views.dest),
    pipe: compile
  };
};
