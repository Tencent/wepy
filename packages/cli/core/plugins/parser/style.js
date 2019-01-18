exports = module.exports = function () {
  this.register('wepy-parser-style', function (node, ctx) {
    if (ctx.useCache && ctx.sfc.template.parsed) {
      return Promise.resolve(true);
    }
    node.parsed = node.compiled;

    return Promise.resolve(true);
  });
}
