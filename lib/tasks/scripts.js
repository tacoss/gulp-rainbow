'use strict';

var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    multimatch = require('multimatch'),
    changed = require('gulp-changed'),
    webpack = require('webpack-stream');

function to_array(obj) {
  return Array.isArray(obj) ? obj : (obj ? [obj] : []);
}

module.exports = function(options) {
  var src = path.join(options.paths.scripts.cwd, options.paths.scripts.glob),
      dest = path.join(options.paths.dest, options.paths.scripts.dest);

  var filters = ['**', '!**/_*', '!**/_*/**']
    .concat(to_array(options.files.filter))
    .concat(to_array(options.paths.scripts.filter));

  function compile(stream, onError) {
    var config = {
      entry: {},
      resolve: {
        extensions: ['', '.js', '.coffee', '.litcoffee'],
        modulesDirectories: ['web/api', 'web_modules', 'node_modules']
      },
      module: {
        loaders: [
          { test: /\.(?:lit)?coffee$/, loader: require.resolve('coffee-loader') }
        ]
      },
      output: {
        path: dest,
        filename: '[name].js'
      }
    };

    glob
      .sync(src)
      .forEach(function(file) {
        var test_file = path.relative(options.paths.scripts.cwd, file);

        if (multimatch(test_file, filters).length > 0) {
          var fixed_file = path.relative(options.paths.scripts.cwd, file),
              fixed_entry = options.bundle && options.bundle.compact ? '' : '$1$2',
              fixed_keyname = fixed_file.replace(/(?:(\/?)(\w+))?.(?:lit)?coffee$/, fixed_entry);

          //if the file is index or have the same name that parent folder
          var patt = /\b(\w+)\/+((\1|index)\.(coffee|litcoffee))/;

          if (patt.test(fixed_file) === false) {
            return;
          }

          var dest_file = path.join(dest, fixed_keyname + '.js');

          if ((options.env.check === false) || !fs.existsSync(dest_file) || (fs.statSync(file).mtime > fs.statSync(dest_file).mtime)) {
            config.entry[fixed_keyname] = file;
          }
        }
      });

    if (options.env.debug === true) {
      config.devtool = '#inline-source-map';
    }

    return stream.pipe(webpack(config)).on('error', onError);
  }

  function ifChanged(stream, onError) {
    return stream.pipe(changed(dest, {
      extension: '.js'
    })).on('error', onError);
  }

  return {
    src: src,
    dest: dest,
    pipe: compile,
    check: ifChanged
  };
};
