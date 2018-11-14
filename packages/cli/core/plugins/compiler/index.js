const css = require('css');
const path = require('path');
const fs = require('fs');
const RawSource = require('webpack-sources').RawSource;

exports = module.exports = function () {

  ['js', 'json', 'css', 'wxml'].forEach(lang => {
    this.register('wepy-compiler-' + lang, function (node, ctx) {
      node.compiled = {
        code: node.content
      }
      return Promise.resolve(node);
    });
  });

  this.register('wepy-compiler-wxss', function (node, ctx) {
    let code = node.content;

    let ast = css.parse(code);

    ast.stylesheet.rules.forEach(rule => {
      if (rule.type === 'import') {
        let importfile = rule.import;
        if (importfile.startsWith('"') || importfile.startsWith("'")) {
          importfile = importfile.substring(1, importfile.length - 1);
        }
        importfile = path.resolve(ctx.file, '..', importfile);

        let encoding = 'utf-8';

        if (this.assets.get(importfile) === undefined) {
          // add assets dependencies
          this.assets.update(importfile, {
            encoding: encoding,
            source: new RawSource(fs.readFileSync(importfile, encoding)),
          }, { url: true, npm: ctx.npm });

          this.hookUnique('wepy-compiler-wxss', {
            content: fs.readFileSync(importfile, encoding)
          }, Object.assign({}, ctx, { dep: true }));

        }
      }
    });
    node.compiled = {
      code: node.content
    };
    return Promise.resolve(node);
  });
}
