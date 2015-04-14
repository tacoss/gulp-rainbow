'use strict';

var path = require('path');

module.exports = function(options, target) {
  return {
    src: path.join(options.paths[target].cwd, options.paths[target].glob),
    dest: path.join(options.paths.dest, options.paths[target].dest)
  };
};
