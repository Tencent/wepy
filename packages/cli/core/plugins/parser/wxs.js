const path = require('path');

exports = module.exports = function () {
  this.register('before-wepy-parser-wxs', function ({ node, ctx } = {}) {
    return Promise.resolve({ node, ctx });
  });

  this.register('wepy-parser-wxs', function (node, ctx) {

    let moduleId = node.attrs.module;
    let code = node.compiled.code.trim();
    let output = '<wxs module="' + moduleId + '">\n' + code + '\n</wxs>';
    return {
      output
    };
  });
};
