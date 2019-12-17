const css = require('css');
const path = require('path');
const fs = require('fs');
const FileBead = require('../../compile/bead').FileBead;

exports = module.exports = function() {
  this.register('compile-wxss', function(chain) {
    const bead = chain.bead;
    let ast;
    try {
      ast = css.parse(bead.content);
    } catch (err) {
      this.logger.error('compiler', err.message);
    }
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

        // if (this.assets.get(importfile) === undefined) {
        let importCode;

        try {
          importCode = fs.readFileSync(importfile, encoding);
        } catch (e) {
          this.logger.warn('compiler', `Can not open file ${importfile} in ${file}`);
        }

        if (importCode) {
          // add assets dependencies
          const newBead = this.producer.make(FileBead, importfile);
          const newChain = chain.createChain(newBead);
          this.hookUnique('make', newChain).then(c => {
            this.producer.assets(c);
          });
          // this.assets.update(
          //   importfile,
          //   {
          //     encoding: encoding,
          //     source: new RawSource(importCode)
          //   },
          //   { url: true, npm: chain.self().npm }
          // );

          this.hookUnique('compile-wxss', newChain);
        }
        // }
      }
    });
    bead.compiled = {
      code: bead.content
    };
    return Promise.resolve(chain);
  });
};
