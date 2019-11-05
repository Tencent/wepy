exports = module.exports = function() {
  this.register('wepy-parser-style', function(chain) {
    const bead = chain.bead;

    // TODO: Check file stat instead of read whole file.
    let fileContent = this.cache.get(bead.id);

    bead.reload(fileContent);
    if (bead.compiled) {
      return Promise.resolve(chain);
    }
    bead.parsed = bead.compiled;
    return chain;
  });
};
