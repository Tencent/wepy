const path = require('path');

exports = module.exports = function () {
  this.register('wepy-parser-wxs', function (node, ctx) {

    if (ctx.useCache && ctx.sfc.template.parsed) {
      return Promise.resolve(true);
    }
    let moduleId = node.attrs.module;
    let code = node.compiled.code.trim();
    let output = '<wxs module="' + moduleId + '">\n' + code + '\n</wxs>';
    node.parsed = {
      output
    };
    return Promise.resolve(true);
  });
};
