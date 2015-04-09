'use strict';

require('gulp-rainbow')({
  tasks: ['clean', 'install', 'vendor', 'images', 'styles', 'views', 'server'],
  gulp: require('gulp')
});
