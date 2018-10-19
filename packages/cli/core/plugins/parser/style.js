exports = module.exports = function () {
  this.register('before-wepy-parser-style', function ({ node, ctx } = {}) {
    return Promise.resolve({ node, ctx });
  });

  this.register('wepy-parser-style', function (node, ctx) {
    return Promise.resolve(node.compiled);
  });
}
