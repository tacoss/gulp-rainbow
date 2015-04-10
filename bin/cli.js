#!/usr/bin/env node

'use strict';

var fs = require('fs-extra'),
    path = require('path'),
    options = require('yargs').argv,
    child_process = require('child_process');

var die = process.exit.bind(process);

var cwd = process.cwd(),
    src_dir = path.join(cwd, 'src'),
    gulpfile = path.join(cwd, 'gulpfile.js'),
    bowerfile = path.join(cwd, 'bower.json'),
    node_modules = path.join(cwd, 'node_modules'),
    gulp_symlink = path.join(node_modules, 'gulp'),
    rainbow_symlink = path.join(node_modules, 'gulp-rainbow');

if (typeof options.cwd === 'string') {
  src_dir = path.resolve(src_dir, options.cwd);
}

function read(file) {
  return fs.readFileSync(file).toString();
}

function write(message) {
  process.stdout.write(message);
}

function banner() {
  var r = require('ansi-rainbow').r;

  var pkg = require(path.resolve(__dirname, '../package.json'));

  write([

    // figlet -f rectangles "gulp rainbow"
    r('         _                _     _             '),
    r(' ___ _ _| |___    ___ ___|_|___| |_ ___ _ _ _ '),
    r('| . | | | | . |  |  _| .\'| |   | . | . | | | |'),
    r('|_  |___|_|  _|  |_| |__,|_|_|_|___|___|_____|'),
    r('|___|     |_|                           v' + pkg.version)

  ].join('\n') + '\n\n');
}

function is_dir(fullpath) {
  return fs.existsSync(fullpath) && fs.statSync(fullpath).isDirectory();
}

function is_file(fullpath) {
  return fs.existsSync(fullpath) && fs.statSync(fullpath).isFile();
}

function execute(label, callback) {
  write(label + ' ... ');

  try {
    callback();

    write('OK\n');
  } catch (e) {
    write('FAIL\n\n');
    write(e.message || e.toString());

    die(1);
  }
}

function rebase(name) {
  var base_dir = path.join(src_dir, name);

  if (!is_dir(base_dir)) {
    execute('Adding sources to "' + name + '" base', function() {
      fs.copySync(path.join(__dirname, 'stub/src/default'), base_dir);
    });

    write('\n');
  }
}

function create() {
  if (!is_dir(src_dir)) {
    execute('Copying default sources', function() {
      fs.copySync(path.join(__dirname, 'stub'), cwd);
    });
  }

  if (!is_file(bowerfile)) {
    execute('Creating default bower.json', function() {
      fs.outputJsonSync(path.join(cwd, 'bower.json'), {
        name: path.basename(cwd),
        version: '0.0.0',
        dependencies: {
          'semantic-ui': 'git@github.com:gextech/Semantic-UI.git'
        },
        overrides: {
          'semantic-ui': {
            main: [
              'dist/themes/default/**'
            ]
          }
        }
      });
    });
  }

  if (!is_file(gulpfile)) {
    execute('Creating default gulpfile.js', function() {
      var code = [
        "require('gulp-rainbow')({",
        "  tasks: ['clean', 'install', 'vendor', 'images', 'styles', 'views', 'server'],",
        "  gulp: require('gulp'),",
        "  cwd: '" + path.relative(path.join(cwd, 'src'), src_dir) + "'",
        "});"
      ].join('\n') + '\n';

      fs.outputFileSync(gulpfile, code);
    });
  }

  write('\n');
}

function usage() {
  write('Usage info:\n');

  if (is_file(gulpfile) && is_dir(src_dir)) {
    write('  - Type "rainbow init" to start the development server\n');
    write('  - Type "rainbow init sitename" to work on a new whole site\n');
  } else {
    write('  - Type "rainbow init" if you want to start a new project here\n');
  }
}

function spawn(base) {
  if (!(is_dir(gulp_symlink) && is_dir(rainbow_symlink))) {
    var src = path.resolve(__dirname, '../node_modules');

    if (!is_dir(node_modules) && read(gulpfile).indexOf('gulp-rainbow') > -1) {
      fs.mkdirSync(node_modules);
    }

    if (!is_dir(gulp_symlink)) {
      fs.symlinkSync(path.join(src, 'gulp'), gulp_symlink, 'dir');
    }

    if (!is_dir(rainbow_symlink)) {
      fs.symlinkSync(path.resolve(__dirname, '..'), rainbow_symlink, 'dir');
    }
  }

  var args = [];

  if (base) {
    args.push('--base', base);
  }

  if (options.open) {
    args.push('--open');
  }

  child_process.spawn('gulp', ['rainbow'].concat(args), {
    stdio: 'inherit'
  });
}

banner();

var action = options._[0];

switch (action) {
  case 'init':
    var base = options._[1];

    if (!(is_dir(src_dir) && is_file(gulpfile) && is_file(bowerfile))) {
      create();
    }

    if (base) {
      rebase(base);
    }

    spawn(base);
  break;

  default:
    usage();

    if (action) {
      write('\nUnknown action "' + action + '"\n');

      die(1);
    }
  break;
}
