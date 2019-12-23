const { ReplaceSource, RawSource } = require('../../compile/source');

exports = module.exports = function() {
  this.register('parse-style', function(chain) {
    chain = chain.sfc ? chain.sfc.styles : chain;

    const bead = chain.bead;
    const compiledCode = bead.compiled.code;

    if (bead.parsed) {
      return Promise.resolve(chain);
    }
    bead.parsed = {
      code: new ReplaceSource(new RawSource(compiledCode))
    };
    return chain;
  });
};
