'use strict';

var path = require('path'),
    glob = require('glob'),
    webpack = require('webpack');

module.exports = function(options) {
  return function(done) {
    var dest_dir = path.join(options.paths.dest, options.paths.scripts.dest);

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
        path: dest_dir,
        filename: '[name].js'
      }
    };

    glob
      .sync(path.join(options.paths.scripts.cwd, options.paths.scripts.glob))
      .forEach(function(file) {
        if (!/[\/\\]_/.test(file)) {
          var fixed_file = path.relative(options.paths.scripts.cwd, file),
              fixed_entry = options.bundle && options.bundle.compact ? '' : '$1$2';

          config.entry[fixed_file.replace(/(?:(\/?)(\w+))?.(?:lit)?coffee$/, fixed_entry)] = file;
        }
      });

    if (options.env.debug === true) {
      config.devtool = '#inline-source-map';
    }

    webpack(config, done);
  };
};
