'use strict';

var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    changed = require('gulp-changed'),
    webpack = require('gulp-webpack');

module.exports = function(options) {
  var src = path.join(options.paths.scripts.cwd, options.paths.scripts.glob),
      dest = path.join(options.paths.dest, options.paths.scripts.dest);

  function compile(stream, onError) {
    var config = {
      entry: {},
      resolve: {
        extensions: ['', '.js', '.coffee', '.litcoffee']
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
      .sync(path.join(options.paths.scripts.cwd, options.paths.scripts.glob))
      .forEach(function(file) {
        if (!/[\/\\]_/.test(file)) {
          var fixed_file = path.relative(options.paths.scripts.cwd, file),
              fixed_entry = options.bundle && options.bundle.compact ? '' : '$1$2',
              fixed_keyname = fixed_file.replace(/(?:(\/?)(\w+))?.(?:lit)?coffee$/, fixed_entry);

          var dest_file = path.join(dest, fixed_keyname + '.js');

          if (!fs.existsSync(dest_file) || (fs.statSync(file).mtime > fs.statSync(dest_file).mtime)) {
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
