const css = require('css');
const path = require('path');
const fs = require('fs');
const RawSource = require('webpack-sources').RawSource;

exports = module.exports = function() {
  this.register('compile-wxss', function(chain) {
    const bead = chain.bead;
    let ast = css.parse(bead.content);
    const file = bead.path;

    ast.stylesheet.rules.forEach(rule => {
      if (rule.type === 'import') {
        let importfile = rule.import;
        // eslint-disable-next-line
        if (importfile.startsWith('"') || importfile.startsWith("'")) {
          importfile = importfile.substring(1, importfile.length - 1);
        }
        importfile = path.resolve(file, '..', importfile);

        let encoding = 'utf-8';

        if (this.assets.get(importfile) === undefined) {
          let importCode;

          try {
            importCode = fs.readFileSync(importfile, encoding);
          } catch (e) {
            this.logger.warn('compiler', `Can not open file ${importfile} in ${file}`);
          }

          if (importCode) {
            // add assets dependencies
            this.assets.update(
              importfile,
              {
                encoding: encoding,
                source: new RawSource(importCode)
              },
              { url: true, npm: chain.npm.self }
            );

            this.hookUnique(
              'wepy-compiler-wxss',
              {
                content: importCode
              },
              chain
            );
          }
        }
      }
    });
    bead.compiled = {
      code: bead.content
    };
    return Promise.resolve(chain);
  });
};
