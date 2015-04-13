'use strict';

var path = require('path');

module.exports = function(options, target, dir) {
  return {
    src: path.join(options.cwd, options.glob),
    dest: path.join(target, dir)
  };
};
