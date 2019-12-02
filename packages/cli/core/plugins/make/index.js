exports = module.exports = function() {
  this.register('make-lookup-lang', function(bead, type) {
    if (bead.lang) {
      return bead.lang;
    }
    const ext = bead.ext;
    const rule = this.options.weappRule[type];
    let lang = null;
    for (let i = 0; i < rule.length; i++) {
      if (rule[i].ext === ext) {
        lang = rule[i].lang;
        break;
      }
    }
    if (!lang) {
      lang = rule[0].lang;
    }
    return lang;
  });

  this.register('make', function(chain, type) {
    const bead = chain.bead;
    const lang = this.hookUnique('make-lookup-lang', bead, type);
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
