'use strict';

var exit = process.exit.bind(process);

var fs = require('fs'),
    path = require('path'),
    util = require('gulp-util'),
    debug = require('gulp-debug'),
    watch = require('gulp-watch'),
    filter = require('gulp-filter'),
    sequence = require('gulp-sequence');

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

function errorHandler(e) {
  util.log(util.colors.red(e.stack || e.message));
  this.emit('end');
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
      sources = options.files || {};

  options.build = !!isBuild;

  if (options.bundle === true) {
    options.bundle = {
      compact: true
    };
  }

  if (typeof options.bundle === 'object') {
    options.bundle.compact = options.bundle.compact !== false;
  }

  sources.filter = sources.filter || [];
  sources.vendor = sources.vendor || '';
  sources.bower = sources.bower || '';
  sources.env = sources.env || '';
  sources.site = sources.site || '';
  sources.data = sources.data || '';
  sources.dest = sources.dest || '';
  sources.views = sources.views || {};
  sources.fonts = sources.fonts || {};
  sources.styles = sources.styles || {};
  sources.images = sources.images || {};
  sources.sprites = sources.sprites || {};
  sources.scripts = sources.scripts || {};

  options.paths = expandVariables({
    fonts: {
      on: path.join(base_dir, sources.fonts.src || 'fonts', '**/*.{ttf,otf,eot,woff,woff2,svg}'),
      cwd: path.join(base_dir, sources.fonts.src || 'fonts'),
      dest: sources.fonts.dest || 'fonts',
      glob: '**/*.{ttf,otf,eot,woff,woff2,svg}'
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
        path.join(base_dir, (sources.site || '_site') + '/**/*.{variables,overrides}'),
        path.join(base_dir, sources.styles.src || 'styles', '**/*.less'),
        path.join(base_dir, sources.env || 'env.yml')
      ],
      cwd: path.join(base_dir, sources.styles.src || 'styles'),
      dest: sources.styles.dest || 'css',
      glob: '**/' + (options.bundle ? 'index' : '*') + '.less'
    },
    scripts: {
      on: path.join(base_dir, sources.scripts.src || 'scripts', '**/*.{coffee,litcoffee}'),
      cwd: path.join(base_dir, sources.scripts.src || 'scripts'),
      dest: sources.scripts.dest || 'js',
      glob: '**/' + (options.bundle ? 'index' : '*') + '.{coffee,litcoffee}'
    },
    views: {
      on: [
        path.join(base_dir, sources.views.src || 'views', '**/*.*'),
        path.join(base_dir, (sources.data || 'data') + '/*.yml')
      ],
      ext: sources.views.ext || '.html',
      cwd: path.join(base_dir, sources.views.src || 'views'),
      dest: sources.views.dest || '',
      glob: '**/*.jade'
    },
    data: {
      cwd: path.join(base_dir, sources.data || 'data'),
      glob: '*.yml'
    },
    vendor: sources.vendor || 'vendor',
    bower: path.join(process.cwd(), sources.bower || ''),
    dest: path.join(process.cwd(), sources.dest || 'generated'),
    env: path.join(base_dir, sources.env || 'env.yml')
  }, options.params || {});

  options.env = util.env;

  var copyTask = require('./tasks/copy');

  var rainbow = {
    clean: require('./tasks/clean')(options),
    fonts: copyTask(options, 'fonts'),
    images: copyTask(options, 'images'),
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

  ['fonts', 'images', 'sprites', 'styles', 'scripts', 'views']
    .forEach(function(task) {
      if (is_dir(options.paths[task].cwd)) {
        tasks.push(task);
      }
    });

  if (!(options.server === false || isBuild)) {
    tasks.push('server');
  }

  tasks
    .forEach(function(task) {
        var files = options.paths[task],
            callback = rainbow[task];

        var prefix = options.prefix ? options.prefix + ':' : 'rainbow:';

        if (callback) {
          main.push(prefix + task);

          if (typeof callback === 'function') {
            gulp.task(prefix + task, callback);
          } else {
            gulp.task(prefix + task, function() {
              var chain = gulp.src(callback.src);

              if (typeof callback.check === 'function') {
                chain = hook(chain, callback.check);
              }

              chain = chain
                .pipe(filter(['**', '!**/_*', '!**/_*/**']
                  .concat(to_array(sources.filter))
                  .concat(to_array(files.filter))));

              chain = hook(chain, sources[task].before)
                .pipe(debug({ title: prefix + task }));

              if (typeof callback.pipe === 'function') {
                chain = hook(chain, callback.pipe);
              }

              return hook(chain, sources[task].after)
                .pipe(gulp.dest(callback.dest));
            });
          }

          if (files && files.on && !isBuild) {
            watch(files.on, function() {
              gulp.start(prefix + task);
            });
          }
        } else {
          util.log(util.colors.red('Unknown rainbow-task `' + task + '`'));
          exit(1);
        }
      });

  if (options.prefix) {
    return sequence.use(gulp).apply(null, main);
  }

  gulp.task('rainbow', sequence.use(gulp).apply(null, main));
};

module.exports.server = function(root) {
  return require('./tasks/server')({
    paths: { dest: root },
    env: util.env
  });
};
