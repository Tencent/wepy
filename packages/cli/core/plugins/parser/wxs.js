const path = require('path');

exports = module.exports = function () {
  this.register('wepy-parser-wxs', function (node, ctx) {

    let moduleId = node.attrs.module;
    let code = node.compiled.code;

    return {
      output: `<wxs module="${moduleId}">
      ${code}
      </wxs>
      `
    };
  });
};
