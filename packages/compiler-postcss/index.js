const postcss = require('postcss')

exports = module.exports = function (options = {}) {
  const {plugins = [], ...other} = options
  return function () {
    this.register('wepy-compiler-postcss', function (node, ctx) {

      let file = typeof ctx === 'string' ? ctx : ctx.file;

      return postcss(plugins).process(node.content || '', {
        from: file,
        ...other
      }).then(res => {
        node.compiled = {
          code: res.css
        }
        return node
      })
    })
  }
}
