exports = module.exports = function() {
  ['js', 'json', 'css', 'wxml'].forEach(lang => {
    this.register('wepy-compiler-' + lang, function(node, ctx) {
      node.compiled = {
        code: node.content
      };
      return Promise.resolve(node);
    });
  });
};
