exports = module.exports = function() {
  const langExtCache = [];
  this.register('make-lookup-lang-from-ext', function(ext) {
    if (langExtCache[ext]) {
      return langExtCache[ext];
    }
    const rst = [];
    const rule = this.options.weappRule;
    for (let k in rule) {
      rule[k].forEach(item => {
        if (item.ext === ext) {
          rst.push(item);
        }
      });
    }
    langExtCache[ext] = rst;
    return rst;
  });

  this.register('make-lookup-lang', function(bead, type) {
    if (bead.lang) {
      return bead.lang;
    }
    const ext = bead.ext;
    if (type === undefined) {
      const rule = this.hookUnique('make-lookup-lang-from-ext', ext);
      if (rule.length === 0) {
        throw new Error('Can not from any rule for ext: ' + ext);
      }
      return rule[0].lang;
    } else {
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
    }
  });

  /**
   *
   *       make               ->         chain.bead
   *         |
   *   before-compile
   *         |
   *      compile             ->         chain.bead.compiled
   *         |
   *    before-parse
   *         |
   *       parse              ->         chain.bead.parsed
   */
  this.register('make', function(chain, type) {
    const bead = chain.bead;
    const lang = this.hookUnique('make-lookup-lang', bead, type);
    type = type || lang;
    // Compile chain
    const key = 'compile-' + lang;
    if (!this.hasHook(key)) {
      throw new Error(`Compiler "${key}" is not find.`);
    }
    return this.hookAsyncSeq('before-' + key, chain.previous)
      .then(() => {
        return this.hookUnique(key, chain);
      })
      .then(chain => {
        // Parse chain
        const key = 'parse-' + type;
        if (!this.hasHook(key)) {
          throw new Error(`Parser "${key}" is not find.`);
        }
        return this.hookAsyncSeq('before-' + key, chain).then(chain => {
          return this.hookUnique(key, chain);
        });
      });
  });
};
