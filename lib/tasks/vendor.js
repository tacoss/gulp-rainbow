'use strict';

var fs = require('fs-extra'),
    path = require('path'),
    glob = require('glob'),
    mainBowerFiles = require('main-bower-files');

function is_file(fullpath) {
  return fs.existsSync(fullpath) && fs.statSync(fullpath).isFile();
}

module.exports = function(options) {
  var bower_dir = path.resolve(options.paths.bower, 'bower_components');

  return function(done) {
    glob.sync(path.join(bower_dir, 'rainbow-ui-*'))
      .forEach(function(addon_dir) {
        var data  = fs.readJsonSync(path.join(addon_dir, 'bower.json')),
            files = Array.isArray(data.main) ? data.main : [data.main];

        files.forEach(function(filter) {
          glob.sync(path.resolve(addon_dir, filter)).forEach(function(file) {
            fs.copySync(file, path.resolve(bower_dir, 'semantic-ui', path.relative(addon_dir, file)));
          });
        });
      });

    mainBowerFiles().forEach(function(src) {
      if (is_file(src)) {
        fs.copySync(src, path.join(options.paths.dest, options.paths.vendor, path.relative(bower_dir, src)));
      }
    });

    done();
  };
};
