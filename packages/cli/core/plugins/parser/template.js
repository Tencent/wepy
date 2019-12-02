const xmllint = require('../../util/xmllint');

exports = module.exports = function() {
  this.register('wepy-parser-template', function(chain) {
    const bead = chain.bead;

    if (bead.parsed) {
      return Promise.resolve(chain);
    }

    // If it's weapp, do not compile it.
    if (chain.self().weapp) {
      chain.sfc.template.parsed = {
        code: bead.content,
        rel: {}
      };
      return chain;
    }

    let code = bead.content;
    let msg = xmllint.verify(code);
    msg.forEach(item => {
      let type = item.type === 'warning' ? 'warn' : 'error';
      this.hookUnique(
        'error-handler',
        'template',
        {
          chain,
          message: item.message,
          type: type,
          title: 'verify'
        },
        {
          start: { line: item.line, column: item.col }
        }
      );
    });

    let components = {};
    let sfcConfig = chain.previous.sfc.config;

    let usingComponents = sfcConfig && sfcConfig.bead.parsed.source ? sfcConfig.bead.parsed.source.usingComponents : {};

    for (let k in usingComponents) {
      components[k] = {
        path: usingComponents[k]
      };
    }

    bead.parsed = {
      rel: {
        components,
        handlers: {},
        on: {}
      }
    };
    return this.hookUnique('template-parse', chain);
  });
};
