const css = require('css');
const path = require('path');
const fs = require('fs');
const RawSource = require('webpack-sources').RawSource;

exports = module.exports = function() {
  this.register('wepy-compiler-wxss', function(node, ctx) {
    let code = node.content;

    let ast = css.parse(code);

    ast.stylesheet.rules.forEach(rule => {
      if (rule.type === 'import') {
        let importfile = rule.import;
        // eslint-disable-next-line
        if (importfile.startsWith('"') || importfile.startsWith("'")) {
          importfile = importfile.substring(1, importfile.length - 1);
        }
        importfile = path.resolve(ctx.file, '..', importfile);

        let encoding = 'utf-8';

        if (this.assets.get(importfile) === undefined) {
          let importCode;

          try {
            importCode = fs.readFileSync(importfile, encoding);
          } catch (e) {
            this.logger.warn('compiler', `Can not open file ${importfile} in ${ctx.file}`);
          }

          if (importCode) {
            // add assets dependencies
            this.assets.update(
              importfile,
              {
                encoding: encoding,
                source: new RawSource(importCode)
              },
              { url: true, npm: ctx.npm }
            );

            this.hookUnique(
              'wepy-compiler-wxss',
              {
                content: importCode
              },
              Object.assign({}, ctx, { dep: true })
            );
          }
        }
      }
    });
    node.compiled = {
      code: node.content
    };
    return Promise.resolve(node);
  });
};
