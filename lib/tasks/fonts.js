'use strict';

var path = require('path');

module.exports = function(options) {
  return {
    src: path.join(options.paths.images.cwd, '**', options.paths.images.glob),
    dest: path.join(options.paths.dest, 'img')
  };
};
