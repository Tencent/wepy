exports = module.exports = function () {
  this.register('wepy-parser-style', function (node, ctx) {
    if (ctx.useCache && node.parsed) {
      return Promise.resolve(true);
    }
    node.parsed = node.compiled;

    return Promise.resolve(true);
  });
}
