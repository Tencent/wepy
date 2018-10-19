const xmllint = require('../../util/xmllint');
const errorHandler = require('../../util/error');

exports = module.exports = function () {
  this.register('before-wepy-parser-template', function ({ node, ctx } = {}) {
    return Promise.resolve({ node, ctx });
  });

  this.register('wepy-parser-template', function (node, ctx) {
    let code = node.content;
    let msg = xmllint.verify(code);
    msg.forEach(item => {
      let type = item.type === 'warning' ? 'warn' : 'error';
      this.hookUnique('error-handler', 'template', {
        ctx: ctx,
        message: item.message,
        type: type,
        title: 'verify'
      }, {
        start: {line: item.line, column: item.col}
      });
      //errorHandler[type](item.message, ctx.file, code, { start: {line: item.line, column: item.col}});
    });

    let components = {};
    let sfcConfig = ctx.sfc.config;

    let usingComponents = sfcConfig && sfcConfig.parsed.output  ? sfcConfig.parsed.output.usingComponents : {};

    for (let k in usingComponents) {
      components[k] = {
        path: usingComponents[k]
      };
    }

    return this.hookUnique('template-parse', node.content, components, ctx).then(rst => {
      let parsed = {
        code: rst.code,
        rel: rst.rel
      };
      return parsed;
    });
  });
}
