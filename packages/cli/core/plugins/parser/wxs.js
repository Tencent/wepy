const path = require('path');
const WxsBead = require('../../compile/bead').WxsBead;
const { ReplaceSource, RawSource } = require('../../compile/source');

exports = module.exports = function() {
  this.register('parse-wxs', function(chain) {
    const bead = chain.bead;
    if (bead.parsed) {
      return Promise.resolve(chain);
    }
    let validRef = bead.refPath !== bead.path;
    let moduleId = bead.module;
    let compiledCode = bead.compiled.code.trim();

    compiledCode = `<wxs module="${moduleId}"${validRef ? ' src="' + path.relative(path.dirname(bead.path), bead.refPath) + '"' : ''}>${
      !validRef ? '\n' + compiledCode + '\n' : ''
    }</wxs>`;
    
    bead.parsed = {
      code: new ReplaceSource(new RawSource(compiledCode))
    };

    if (validRef) {
       // e.g. a.wpy <script src=b.js />, error handler shows b.js
      const newBead = this.producer.make(WxsBead, bead.refPath);
      newBead.lang = bead.lang;
      const newChain = chain.createChain(newBead);

      return this.hookUnique('make', newChain, 'file')
        .then((c) => {
          this.producer.asserts(c);
        })
        .then(() => chain);
    }
    return Promise.resolve(chain);
  });
};
