exports = module.exports = function () {

  ['js', 'json', 'css', 'wxml', 'wxss'].forEach(lang => {
    this.register('wepy-compiler-' + lang, function (node, file) {
      node.compiled = {
        code: node.content
      }
      return Promise.resolve(node);
    });
  })
}
