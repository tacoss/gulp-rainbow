'use strict';

var bower = require('gulp-bower');

module.exports = function() {
  return function() {
    return bower();
  };
};
