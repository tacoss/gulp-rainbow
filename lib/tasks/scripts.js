'use strict';

var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    multimatch = require('multimatch'),
    changed = require('gulp-changed'),
    webpack = require('webpack'),
    gulpwebpack = require('webpack-stream');

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
      plugins: [
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: true
          }
        })
      ],
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
          var fixed_file = path.relative(options.paths.scripts.cwd, file);

          if (options.bundle && options.bundle.compact) {
            fixed_file = fixed_file.replace(/(\w+)\/(?:\1|index)/, '$1');
          }

          fixed_file = fixed_file.replace(/\.(?:lit)?coffee$/, '');

          var dest_file = path.join(dest, fixed_file + '.js');

          if ((options.env.check === false) || !fs.existsSync(dest_file) || (fs.statSync(file).mtime > fs.statSync(dest_file).mtime)) {
            config.entry[fixed_file] = file;
          }
        }
      });

    if (options.env.debug === true) {
      // no uglify plugin until source-maps fix
      config.plugins = null;
      config.devtool = '#inline-source-map';
    }

    return stream.pipe(gulpwebpack(config)).on('error', onError);
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
