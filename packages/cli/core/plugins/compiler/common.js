exports = module.exports = function() {
  ['js', 'json', 'css', 'wxml'].forEach(lang => {
    this.register('wepy-compiler-' + lang, function(chain) {
      chain.bead.compiled = {
        code: chain.bead.content
      };
      return Promise.resolve(chain);
    });
  });
};
