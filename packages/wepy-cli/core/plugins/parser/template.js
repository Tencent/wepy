const xmllint = require('../../util/xmllint');
const errorHandler = require('../../util/error');

exports = module.exports = function () {
  this.register('wepy-parser-template', function (node, ctx) {
    let code = node.content;
    let msg = xmllint.verify(code);
    msg.forEach(item => {
      let type = item.type === 'warning' ? 'warn' : 'error';
      errorHandler[type](item.message, ctx.file, code, { start: {line: item.line, column: item.col}});
    });

    return this.hookUnique('template-parse', node.content).then(rst => {
      let parsed = {
        code: rst.code,
        rel: rst.rel
      };
      return parsed;
    });
  });
}
