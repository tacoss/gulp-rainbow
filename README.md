**Rainbow** are our `gulp` tasks for front-end development.

It leverages on `bower`, `jade`, `less`, `coffee-script` and `semantic-ui` for build our production assets.

## Dependencies

Since it's a `gulp` plugin you must have a `gulpfile.js` with this:

```js
require('gulp-rainbow')({
  // see options below
});
```

## Options

**server** (boolean|optional) &mdash; if `false`, the server task will be disabled

**proxy** (string|optional) &mdash; used instead of `server` to setup a proxy

```js
// custom proxy
proxy: 'localhost:8080'
```

**build** (boolean|optional) &mdash; if `true`, will disable the `server` and `watch` tasks

```js
// using argvs
build: process.argv.indexOf('build') > -1
```

**files** (object|optional) &mdash; used for setup all the source directories

```js
// rainbow defaults
{
  dest: 'generated',
  views: { src: 'views', dest: '' },
  fonts: { src: 'fonts', dest: 'fonts' },
  styles: { src: 'styles', dest: 'css' },
  images: { src: 'images', dest: 'img' },
  scripts: { src: 'scripts', dest: 'js' }
}
```

> Values for `src` must be relative to the current `base` directory

Also, some tasks can use `before` and `after` hooks:

```js
// common gulp plugins
var rename = require('gulp-rename');

// after-hook for generated views
views: {
  after: function(task) {
    return task.pipe(rename(function(file) {
      file.extname = '.jsp';
    }));
  }
}
```

**gulp** (object|required) &mdash; the `gulp` instance to hook-up

```js
// or pass your `gulp` instance
gulp: require('gulp')
```

**base** (boolean|optional) &mdash; if `false` will disable the `base` feature

> You can use `--no-base` on the CLI for achieving the same

**cwd** (string|optional) &mdash; current working directory

```js
// any sub-directory within `src/`
cwd: 'web/bases'
```

## Tasks

Available tasks: `clean`, `install`, `vendor`, `fonts`, `images`, `styles`, `scripts`, `views` and `server`

Some tasks are automatically setup if their `src` directory exists, i.e. `scripts` task will be registered only if the `src/default/scripts` directory is present.

> All tasks are prefixed by default, i.e. `gulp rainbow:clean`

Type `gulp rainbow` to execute all the predefined tasks in sequence.

## Folder structure

Rainbow requires a pre-defined directory structure to work, i.e:

```bash
$ tree src
# src/
#  default/         <- required for custom bases
#   ├── env.yml
#   ├── fonts
#   ├── images
#   ├── scripts
#   ├── styles
#   └── views
```

> Note that entry point will be always `src/` but you can use the `cwd` option the point out another sub-directory within

Additionally you can use the `--base` option to setup another sub-directory, i.e:

```bash
$ gulp rainbow --base custom
# will use the sub-directory `src/custom` instead
# if you set the `cwd` as `foo/bar` it will use `src/foo/bar/custom`
```

This means you can work on several projects using the same installation.

## File sources

**env.yml** &mdash; settings used to configure our `semantic-ui` dependencies among other things (see the integrations below)

**images/** &mdash; all `*.{jpg,jpeg,png,svg}` files will be copied to the `generated/img/` directory

**scripts/** &mdash; all `*.{coffee,litcoffee}` files will be compiled to the `generated/js/` directory

**styles/** &mdash; all `*.less` files will be compiled to the `generated/css/` directory

**views/** &mdash; all `*.jade` files will be compiled to the `generated/` directory

**fonts/** &mdash; all `*.{ttf,otf,eot,woff,woff2,svg}` files will be compiled to the `generated/fonts/` directory


> Any file or directory starting with an underscore will be skipped, i.e. `_mixins.jade`, `styles/_mixins/hidden.less`, etc.

## Integrations

**Bower**

You can use any dependency from bower directly in your sources.

For `*.less` files we've made the `bower_components/` directory available for `@import`, i.e:

```less
@import './semantic-ui/src/semantic.less';
```

In your `*.jade` files you can inline any dependency using `<link>` or `<script>` tags respectively.

```jade
link(rel='stylesheet', href='vendor/semantic-ui/dist/semantic.css')
script(src='vendor/jquery/dist/jquery.min.js')
```

> All bower dependencies are available under the `vendor/` after you ran the `vendor` task
>
> If you're using sub-directories please consider using a `<base>` tag for avoiding `../` paths

**Semantic-UI**

We haven't found yet a reliable solution for crafting our custom themes, elements and such without cloning the entire repository.

Also we wanted to use only the elements that are really needed, nothing else.

For solving this issues we hack the `semantic-ui` sources on every `gulp` session just overriding the `semantic.less` and `theme.config` files using the following settings:

[bin/stub/src/default/env.yml](https://github.com/gextech/gulp-rainbow/blob/master/bin/stub/src/default/env.yml)

> Just comment out the elements or sections you really need include

**Add-ons for Semantic-UI**

In order to reuse custom components we've defined a simple convention for that:

Each module within `bower_components/` directory prefixed as `rainbow-ui-` will be merged with the `semantic-ui` sources.

These modules must have the following directory structure:

```bash
$ tree src
# src/
#   ├── _site
#   ├── definitions
#   ├── themes
```

Of course it must have a `bower.json` manifest, which should expose their sources in the `main` property:

```json
{
  "name": "rainbow-ui-osom_component",
  "version": "1.0.0",
  "main": [
    "src/**/*.*"
  ]
}
```

> This structure is the same as `semantic-ui` source, so you can override almost everything inside

The last thing is doing `bower install rainbow-ui-osom_component --save` and that's it.

Restart your gulp (rainbow) tasks and enjoy!

## CLI utility

For sake of simplicity you can install rainbow globally:

```bash
$ npm install -g gulp-rainbow
```

Now you can share the same rainbow installation across multiple projects.

Try creating a new empty project for that:

```bash
$ mkdir rainbow-test
$ cd rainbow-test
$ rainbow init
```

If you're using a previous rainbow installation with the CLI please remove all `node_modules` before.

> Make sure you're specifying the `--cwd foo/bar` as defined in the `gulpfile.js` (if present)

## Issues?

We're working on `gulp-rainbow` almost every day.

Please send an issue or feel free to PR.
