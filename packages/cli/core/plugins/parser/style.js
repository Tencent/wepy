exports = module.exports = function () {
  this.register('wepy-parser-style', function (node, ctx) {
    return Promise.resolve(node.compiled);
  });
}
