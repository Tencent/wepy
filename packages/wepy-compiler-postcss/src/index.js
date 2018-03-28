const postcss = require('postcss')

exports.default = function (content, config, filePath) {
  return new Promise((resolve, reject) => {
    postcss(
      config.plugins
    ).process(content, {
      from: undefined,
    }).then(res => {
      resolve(res.css)
    }).catch(reject)
  })
}