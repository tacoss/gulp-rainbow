'use strict';

var exit = process.exit.bind(process);

var fs = require('fs'),
    path = require('path'),
    util = require('gulp-util'),
    debug = require('gulp-debug'),
    watch = require('gulp-watch'),
    filter = require('gulp-filter'),
    sequence = require('gulp-sequence');

var getData = require('./utils/data');

var mainBowerFiles = require('main-bower-files');

var errorHandler = function(e) {
  util.log(util.colors.red(e.message || e.toString()));
  this.emit('end');
};

function expandVariables(obj, data) {
  if (typeof obj === 'string') {
    return obj.replace(/\$\{(\w+)\}/g, function(match, key) {
      return data[key] || match;
    });
  }

  if (typeof obj === 'object') {
    for (var key in obj) {
      obj[key] = expandVariables(obj[key], data);
    }
  }

  return obj;
}

function to_array(obj) {
  return Array.isArray(obj) ? obj : (obj ? [obj] : []);
}

function is_file(fullpath) {
  return fs.existsSync(fullpath) && fs.statSync(fullpath).isFile();
}

function is_dir(fullpath) {
  return fs.existsSync(fullpath) && fs.statSync(fullpath).isDirectory();
}

function hook(chain, set) {
  if (set) {
    (Array.isArray(set) ? set : [set])
      .forEach(function(task) {
        chain = task(chain, errorHandler)
          .on('error', errorHandler);
      });
  }

  return chain;
}

module.exports = function(options) {
  options = options || {};

  var gulp = options.gulp;

  if (!gulp) {
    util.log(util.colors.red('Missing the main `gulp` instance to work'));
    exit(1);
  }

  var base = typeof util.env.base === 'string' ? util.env.base : 'default',
      base_dir = path.join(process.cwd(), 'src', options.cwd || '', (util.env.base || options.base) !== false ? base : '');

  if (!is_dir(base_dir)) {
    util.log(util.colors.red('The specified base directory `' + base + '` is missing'));
    exit(1);
  }

  var isBuild = options.build || util.env.build,
      sources = options.files || {},
      params = options.params || {},
      iconOptions = options.icons || {};

  params.base = base;
  options.build = !!isBuild;

  if (options.bundle === true) {
    options.bundle = {
      compact: true
    };
  }

  if (typeof options.bundle === 'object') {
    options.bundle.compact = options.bundle.compact !== false;
  }

  var _errorHandler = errorHandler;

  errorHandler = function(e) {
    _errorHandler.call(this, e);

    if (isBuild) {
      exit(1);
    }
  };

  sources.filter = sources.filter || [];
  sources.vendor = sources.vendor || '';
  sources.bower = sources.bower || '';
  sources.env = sources.env || '';
  sources.dest = sources.dest || '';
  sources.views = sources.views || {};
  sources.fonts = sources.fonts || {};
  sources.styles = sources.styles || {};
  sources.images = sources.images || {};
  sources.sprites = sources.sprites || {};
  sources.scripts = sources.scripts || {};
  sources.icons = sources.icons || {};

  var env_file = path.join(base_dir, sources.env || 'env.yml');

  options.paths = expandVariables({
    fonts: {
      on: path.join(base_dir, sources.fonts.src || 'fonts', '**/*.{ttf,otf,eot,woff,woff2,svg}'),
      cwd: path.join(base_dir, sources.fonts.src || 'fonts'),
      dest: sources.fonts.dest || 'fonts',
      glob: '**/*.{ttf,otf,eot,woff,woff2,svg}'
    },
    icons: {
      on: path.join(base_dir, sources.icons.src || 'icons', '**/*.svg'),
      cwd: path.join(base_dir, sources.icons.src || 'icons'),
      dest: sources.fonts.dest || 'fonts',
      glob: '**/*.svg',
      iconFont: {
        fontName: iconOptions.fontName || 'icons',
        svg: true,
        appendUnicode: false,
        fontHeight: 1024,
        startUnicode: iconOptions.startUnicode || 0xF000,
        normalize: iconOptions.normalize || true
      },
      clean: path.join(base_dir, sources.styles.src || 'styles', '_generated'),
      defaultTemplateDest: iconOptions.defaultOutputDir || path.join(base_dir, sources.styles.src || 'styles', '_generated'),
      defaultFontPath: iconOptions.defaultFontPath || sources.fonts.dest || 'fonts',
      className: iconOptions.className || 'icon',
      templates: iconOptions.templates || {
        less: {
          template: path.join(__dirname, 'stubs/icons/template.less'),
          outputName: 'icons.less'
        },
        htmlCatalog: {
          template: path.join(__dirname, 'stubs/icons/templateCatalog.html'),
          outputName: 'iconCatalog.html',
          fontPath: path.join(process.cwd(), sources.dest || 'generated', sources.fonts.dest || 'fonts')
        }
      }
    },
    images: {
      on: path.join(base_dir, sources.images.src || 'images', '**/*.{jpg,jpeg,png,svg}'),
      cwd: path.join(base_dir, sources.images.src || 'images'),
      dest: sources.images.dest || 'img',
      glob: '**/*.{jpg,jpeg,png,svg}'
    },
    sprites: {
      on: path.join(base_dir, sources.sprites.src || 'sprites', '**/*.png'),
      cwd: path.join(base_dir, sources.sprites.src || 'sprites'),
      dest: sources.sprites.dest || 'img',
      glob: '**/*.png'
    },
    styles: {
      on: [
        path.join(path.dirname(env_file), '_site/**/*.{variables,overrides}'),
        path.join(base_dir, sources.styles.src || 'styles', '**/*.less'),
        env_file
      ],
      cwd: path.join(base_dir, sources.styles.src || 'styles'),
      dest: sources.styles.dest || 'css',
      glob: '**/' + (options.bundle ? 'index' : '*') + '.less',
      filter: sources.styles.filter || [],
      watch: sources.styles.watch || []
    },
    scripts: {
      on: path.join(base_dir, sources.scripts.src || 'scripts', '**/*.{coffee,litcoffee}'),
      cwd: path.join(base_dir, sources.scripts.src || 'scripts'),
      dest: sources.scripts.dest || 'js',
      glob: '**/*.{coffee,litcoffee}',
      filter: sources.scripts.filter || [],
      watch: sources.scripts.watch || []
    },
    views: {
      on: [
        path.join(base_dir, sources.views.src || 'views', '**/*.*'),
        path.join(path.dirname(env_file), 'data/**/*.yml'),
        path.join(process.cwd(), 'data/**/*.yml')
      ],
      ext: sources.views.ext || '.html',
      cwd: path.join(base_dir, sources.views.src || 'views'),
      dest: sources.views.dest || '',
      glob: '**/*.jade',
      filter: sources.views.filter || [],
      watch: sources.views.watch || []
    },
    data: {
      src: [
        path.join(path.dirname(env_file), 'data'),
        path.join(process.cwd(), 'data')
      ],
      glob: '**/*.yml'
    },
    vendor: sources.vendor || 'vendor',
    bower: path.join(process.cwd(), sources.bower || ''),
    dest: path.join(process.cwd(), sources.dest || 'generated'),
    env: env_file
  }, params);

  options.env = util.env;

  var copyTask = require('./tasks/copy');

  var rainbow = {
    clean: require('./tasks/clean')(options),
    fonts: copyTask(options, 'fonts'),
    images: copyTask(options, 'images'),
    icons: require('./tasks/icons')(options),
    sprites: require('./tasks/sprites')(options),
    scripts: require('./tasks/scripts')(options),
    install: require('./tasks/install')(options),
    server: require('./tasks/server')(options),
    styles: require('./tasks/styles')(options),
    vendor: require('./tasks/vendor')(options),
    views: require('./tasks/views')(options)
  };

  var main = [],
      tasks = [];

  if (isBuild || options.env.clean === true) {
    tasks.push('clean');
  }

  if (is_file(path.join(options.paths.bower, 'bower.json'))) {
    Array.prototype.push.call(tasks, 'install', 'vendor');
  }

  ['fonts', 'images', 'icons', 'sprites', 'styles', 'scripts', 'views']
    .forEach(function(task) {
      if (is_dir(options.paths[task].cwd)) {
        tasks.push(task);
      }
    });

  if (options.server === true && !isBuild) {
    tasks.push('server');
  }

  tasks
    .forEach(function(task) {
        var files = options.paths[task],
            callback = rainbow[task];

        if (to_array(sources.skip).indexOf(task) > -1) {
          return;
        }

        var prefix = options.prefix ? options.prefix + ':' : 'rainbow:';

        if (callback) {
          main.push(prefix + task);

          if (typeof callback === 'function') {
            gulp.task(prefix + task, callback);
          } else {
            gulp.task(prefix + task, function() {
              var chain = gulp.src(callback.src);

              chain = chain
                .pipe(filter(['**', '!**/_*', '!**/_*/**']
                  .concat(to_array(sources.filter))
                  .concat(to_array(files.filter))));

              if (typeof callback.check === 'function' && (options.env.check !== false)) {
                chain = hook(chain, callback.check);
              }

              chain = hook(chain, sources[task].before);

              if (typeof callback.pipe === 'function') {
                chain = hook(chain, callback.pipe);
              }

              return hook(chain, sources[task].after)
                .pipe(gulp.dest(callback.dest))
                .pipe(debug({ title: prefix + task }));
            });
          }

          if (files && files.on && !isBuild) {
            watch(to_array(files.on).concat(to_array(files.watch)), function() {
              gulp.start(prefix + task);
            });
          }
        } else {
          util.log(util.colors.red('Unknown rainbow-task `' + task + '`'));
          exit(1);
        }
      });

  if (options.before) {
    Array.prototype.unshift.apply(main, to_array(options.before));
  }

  if (options.after) {
    Array.prototype.push.apply(main, to_array(options.after));
  }

  if (options.prefix) {
    return sequence.use(gulp).apply(null, main);
  }

  gulp.task('rainbow', sequence.use(gulp).apply(null, main));
};

module.exports.bowerFiles = function(from) {
  var bower_dir = path.resolve(from, 'bower_components');

  return mainBowerFiles({
    paths: {
      bowerDirectory: path.relative(process.cwd(), bower_dir),
      bowerJson: path.join(from, 'bower.json')
    }
  });
};

module.exports.server = function(root) {
  return require('./tasks/server')({
    paths: { dest: root },
    env: util.env
  });
};

module.exports.data = getData;
