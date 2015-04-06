'use strict';

var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    yaml = require('js-yaml'),
    jade = require('gulp-jade');

module.exports = function(options) {
  function compile() {
    var data = {};

    glob.sync(path.join(options.paths.data.cwd, options.paths.data.glob)).forEach(function(file) {
      data[path.basename(file).replace('.yml', '')] = yaml.load(fs.readFileSync(file));
    });

    return jade({
      pretty: true,
      locals: { data: data }
    });
  }

  var props = options.files && options.files.jade || {};

  return {
    src: path.join(options.paths.views.cwd, options.paths.views.glob),
    dest: options.paths.dest,
    pipe: compile,
    file: props
  };
};
