exports = module.exports = function() {
  this.register('wepy-parser-style', function(node, ctx) {
    // If this file have dependences, then ignore cache for it.
    if (ctx.useCache && node.parsed && (node.parsed.dep || []).length === 0) {
      return Promise.resolve(true);
    }
    node.parsed = node.compiled;

    return Promise.resolve(true);
  });
};
