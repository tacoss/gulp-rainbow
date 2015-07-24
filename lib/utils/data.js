'use strict';

var fs = require('fs'),
    path = require('path');

var glob = require('glob'),
    yaml = require('js-yaml'),
    deepMerge = require('deepmerge');

function push(obj, key, data) {
  var parts = key.split('.');

  while (parts.length > 1) {
    var prop = parts.shift();

    obj = obj[prop] || (obj[prop] = {});
  }

  prop = parts.shift();

  obj[prop] = deepMerge(obj[prop] || {}, data);
}

module.exports = function(from) {
  var data = {};

  glob
    .sync(path.join(from, '**/*.yml'))
    .forEach(function(file) {
      var keypath = path.relative(from, file)
        .replace(/[\\\/]/g, '.')
        .replace('.yml', '');

      push(data, keypath, yaml.load(fs.readFileSync(file)));
    });

  return data;
};
