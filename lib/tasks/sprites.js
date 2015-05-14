'use strict';

var path = require('path'),
    spritesmith = require('gulp.spritesmith');

module.exports = function(options) {
  function compile(stream) {
    return stream.pipe(spritesmith({
        padding: 2,
        imgName: 'sprites.png',
        imgPath: 'sprites.png',
        cssName: 'sprites.css',
        cssTemplate: function(params) {
          if (!params.items.length) {
            return '';
          }

          var css = [],
              retina = [],
              prefix = 'sprite';

          css.push('i[class^="' + prefix + '-"], i[class*=" ' + prefix + '-"] { display: inline-block; background-image: url(' + params.items[0].image + '); font-size: 0; }');

          params.items.forEach(function(sprite) {
            if (sprite.source_image.indexOf('@2x') > -1) {
              retina.push('i.' + prefix + '-' + (sprite.name.replace('@2x', '')) + ' { background-position: -' + (Math.floor(sprite.x / 2)) + 'px -' + (Math.floor(sprite.y / 2)) + 'px; }');
            } else {
              css.push('i.' + prefix + '-' + sprite.name + ' { width: ' + sprite.px.width + '; height: ' + sprite.px.height + '; background-position: ' + sprite.px.offset_x + ' ' + sprite.px.offset_y + '; }');
            }
          });

          if (retina.length) {
            css.push('@media only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx) {');
            css.push('i[class^="' + prefix + '-"], i[class*=" ' + prefix + '-"] { background-size: ' + (Math.floor(params.items[0].total_width / 2)) + 'px ' + (Math.floor(params.items[0].total_height / 2)) + 'px; }');
            css.push(retina.join('\n') + '\n}');
          }

          return css.join('\n');
        }
      }));
  }

  return {
    src: path.join(options.paths.sprites.cwd, options.paths.sprites.glob),
    dest: path.join(options.paths.dest, options.paths.sprites.dest),
    pipe: compile
  };
};
