'use strict';

var fs = require('fs-extra'),
    path = require('path'),
    yaml = require('js-yaml'),
    less = require('gulp-less'),
    rename = require('gulp-rename'),
    changed = require('gulp-changed'),
    lazypipe = require('lazypipe'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    sourcemaps = require('gulp-sourcemaps');

function is_file(fullpath) {
  return fs.existsSync(fullpath) && fs.statSync(fullpath).isFile();
}

function is_dir(fullpath) {
  return fs.existsSync(fullpath) && fs.statSync(fullpath).isDirectory();
}

module.exports = function(options) {
  var src = path.join(options.paths.styles.cwd, options.paths.styles.glob),
      dest = path.join(options.paths.dest, options.paths.styles.dest);

  var bower_dir = path.resolve(options.paths.bower, 'bower_components');

  function compile(stream, onError) {
    var config = [],
        semantic = [];

    var env_vars = is_file(options.paths.env) ? yaml.load(fs.readFileSync(options.paths.env)) : {},
        theme_dir = path.join(path.dirname(options.paths.env), '_site'),
        semantic_src = path.join(bower_dir, 'semantic-ui/src'),
        semantic_less = path.join(semantic_src, 'semantic.less'),
        semantic_config = path.join(semantic_src, 'theme.config');

    if (is_dir(semantic_src) && (env_vars && typeof env_vars.semantic === 'object')) {
      for (var group in env_vars.semantic) {
        for (var kind in env_vars.semantic[group]) {
          semantic.push('& { @import "definitions/' + [group, kind].join('/') + '"; }');
          config.push('@' + kind + ': "' + env_vars.semantic[group][kind] + '";');
        }
      }

      if (is_dir(theme_dir)) {
        config.push('@siteFolder: "' + theme_dir + '";');
      } else {
        config.push('@siteFolder: "_site";');
      }

      config.push('@definitionsFolder: "definitions";');
      config.push('@themesFolder: "themes";');
      config.push('@import "theme.less";');
    }

    fs.outputFileSync(semantic_less, semantic.join('\n'));
    fs.outputFileSync(semantic_config, config.join('\n'));

    var doLess = function() {
      return less({
        paths: [bower_dir, process.cwd(), dest]
      })
      .on('error', onError);
    };

    var nano = function() {
      return cssnano({
        discardComments: { removeAll: true },
        discardEmpty: true,
        discardDuplicates: true,
        mergeLonghand: true,
        reduceTransforms: true,
        mergeRules: true
      }).on('error', onError);
    };

    var partialPipe = lazypipe()
      .pipe(doLess)
      .pipe(nano)
      .pipe(autoprefixer, options.paths.styles.autoprefixer);

    console.log('Autoprefixer: ', options.paths.styles.autoprefixer);

    stream = options.env.debug !== true ? stream.pipe(partialPipe()) : stream
      .pipe(sourcemaps.init())
      .pipe(partialPipe())
      .pipe(sourcemaps.write());

    if (options.bundle && options.bundle.compact) {
      return stream.pipe(rename(function(file) {
        var fixed_name = path.basename(file.dirname);

        file.dirname = file.dirname.substr(0, file.dirname.length - fixed_name.length);
        file.basename = fixed_name || file.basename;
        file.extname = '.css';
      }));
    }

    return stream;
  }

  function ifChanged(stream, onError) {
    return stream.pipe(changed(dest, {
      extension: '.css',
      hasChanged: function(stream, cb, sourceFile, targetPath) {
        if (options.bundle && options.bundle.compact) {
          targetPath = targetPath.replace(/\/?index(\.\w+)$/, '$1');
        }

        changed.compareLastModifiedTime(stream, cb, sourceFile, targetPath);
      }
    })).on('error', onError);
  }

  return {
    src: src,
    dest: dest,
    pipe: compile,
    check: ifChanged
  };
};
