const xmllint = require('../../util/xmllint');

exports = module.exports = function() {
  this.register('wepy-parser-template', function(chain) {
    const bead = chain.bead;

    if (bead.parsed) {
      return Promise.resolve(chain);
    }

    debugger;

    if (chain.weapp.self) {
    }

    // If it's weapp, do not compile it.
    if (ctx.type === 'weapp') {
      ctx.sfc.template.parsed = {
        code: node.content,
        rel: {}
      };
      return Promise.resolve(true);
    }

    let code = node.content;
    let msg = xmllint.verify(code);
    msg.forEach(item => {
      let type = item.type === 'warning' ? 'warn' : 'error';
      this.hookUnique(
        'error-handler',
        'template',
        {
          ctx: ctx,
          message: item.message,
          type: type,
          title: 'verify'
        },
        {
          start: { line: item.line, column: item.col }
        }
      );
      //errorHandler[type](item.message, ctx.file, code, { start: {line: item.line, column: item.col}});
    });

    let components = {};
    let sfcConfig = ctx.sfc.config;

    let usingComponents = sfcConfig && sfcConfig.parsed.output ? sfcConfig.parsed.output.usingComponents : {};

    for (let k in usingComponents) {
      components[k] = {
        path: usingComponents[k]
      };
    }

    return this.hookUnique('template-parse', node.content, components, ctx).then(rst => {
      ctx.sfc.template.parsed = {
        code: rst.code,
        rel: rst.rel
      };
      return Promise.resolve(true);
    });
  });
};
