const RawSource = require('../../compile/source').RawSource;

exports = module.exports = function() {
  this.register('parse-style', function(chain) {
    const bead = chain.bead;
    const compiledCode = bead.compiled.code;

    if (bead.parsed) {
      return Promise.resolve(chain);
    }
    bead.parsed = {
      code: new RawSource(compiledCode)
    };
    return chain;
  });
};
