'use strict';

var fs = require('fs-extra'),
    path = require('path'),
    glob = require('glob'),
    bower = require('gulp-bower'),
    mainBowerFiles = require('main-bower-files');

var bower_dir = path.resolve(process.cwd(), 'bower_components');

function is_file(fullpath) {
  return fs.existsSync(fullpath) && fs.statSync(fullpath).isFile();
}

module.exports = function(options) {
  return function() {
    return bower().on('end', function() {
      glob.sync(path.join(bower_dir, 'semantic-ui-*'))
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
          fs.copySync(src, path.join(options.paths.dest, 'vendor', path.relative(bower_dir, src)));
        }
      });
    });
  };
};
