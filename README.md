**Rainbow** are our `gulp` tasks for front-end development.

It leverages on `bower`, `jade`, `less` and `semantic-ui` for build our production assets.

## Dependencies

Since it's a `gulp` plugin you must have a `gulpfile.js` with this:

```js
require('gulp-rainbow')({
  // see options below
});
```

The available tasks are:

- **clean** &mdash; remove all files from the `generated/` directory
- **copy** &mdash; copy all assets (images & fonts) from their respective directories
- **install** &mdash; run `bower install` for you
- **server** &mdash; starts a `browser-sync` instance
- **styles** &mdash; compile `less` sources from the `styles/` directory
- **vendor** &mdash; copy your `main-bower-files` to the `vendor/` directory
- **views** &mdash; compile your `jade` templates from the `views/` directory

To execute all the defined tasks in sequence just type `gulp rainbow`

> Note that all these tasks are automatically prefixed, i.e. `rainbow:clean`

## Options

**files** (object|optional) &mdash; used for `gulp-rename` as follows:

```js
// given these values
files: {
  jade: {
    extname: '.jsp'
  }
}

// would invoke `gulp-rename` on `.jade` files
rename(function(src) {
  src.extname = '.jsp';
  // etc.
})
```

**gulp** (object|required) &mdash; the `gulp` instance to hook-up

```js
// or pass your `gulp` instance
gulp: require('gulp')
```

**cwd** (string|optional) &mdash; current working directory

```js
// any sub-directory within `src/`
cwd: 'web/bases'
```


## Folder structure

Rainbow requires a pre-defined directory structure to work, i.e:

```bash
$ tree src
# src/
#   ├── env.yml
#   ├── images
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

**styles/** &mdash; all `*.less` files will be compiled to the `generated/css/` directory

**views/** &mdash; all `*.jade` files will be compiled to the `generated/` directory


> Any file or directory starting with an underscore will be skipped for all `.{jade,less}` files, i.e. `_mixins.jade`

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

```yaml
semantic:
  globals:
    reset: 'default'
    site: 'default'

  elements:
    button: 'default'
    divider: 'default'
    flag: 'default'
    header: 'default'
    icon: 'default'
    image: 'default'
    input: 'default'
    label: 'default'
    list: 'default'
    loader: 'default'
    rail: 'default'
    reveal: 'default'
    segment: 'default'
    step: 'default'

  collections:
    breadcrumb: 'default'
    form: 'default'
    grid: 'default'
    menu: 'default'
    message: 'default'
    table: 'default'

  views:
    ad: 'default'
    card: 'default'
    comment: 'default'
    feed: 'default'
    item: 'default'
    statistic: 'default'

  modules:
    accordion: 'default'
    checkbox: 'default'
    dimmer: 'default'
    dropdown: 'default'
    modal: 'default'
    nag: 'default'
    popup: 'default'
    progress: 'default'
    rating: 'default'
    search: 'default'
    shape: 'default'
    sidebar: 'default'
    sticky: 'default'
    tab: 'default'
    transition: 'default'
    video: 'default'
```

Just comment out the elements or sections you really need include.

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
