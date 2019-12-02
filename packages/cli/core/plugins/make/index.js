exports = module.exports = function() {
  this.register('make', function(chain, type) {
    const bead = chain.bead;
    const lang = this.getLang(type, bead.ext);
    // Compile chain
    const key = 'wepy-compiler-' + lang;
    if (!this.hasHook(key)) {
      throw new Error(`Compiler "${key}" is not find.`);
    }
    return this.hookAsyncSeq('before-' + key, chain.previous)
      .then(() => {
        return this.hookUnique(key, chain);
      })
      .then(chain => {
        // Parse chain
        const key = 'wepy-parser-' + type;
        if (!this.hasHook(key)) {
          throw new Error(`Parser "${key}" is not find.`);
        }
        return this.hookAsyncSeq('before-' + key, chain).then(chain => {
          return this.hookUnique(key, chain);
        });
      });
  });
};
