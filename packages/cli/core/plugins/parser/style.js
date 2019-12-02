exports = module.exports = function() {
  this.register('parse-style', function(chain) {
    const bead = chain.bead;

    if (bead.parsed) {
      return Promise.resolve(chain);
    }
    bead.parsed = bead.compiled;
    return chain;
  });
};
