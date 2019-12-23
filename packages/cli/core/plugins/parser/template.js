const xmllint = require('../../util/xmllint');

exports = module.exports = function() {
  this.register('parse-template', function(chain) {
    chain = chain.sfc ? chain.sfc.template : chain;

    const bead = chain.bead;
    const compiledCode = bead.compiled.code;

    if (bead.parsed) {
      return Promise.resolve(chain);
    }
    // If it's weapp, do not compile it.
    // if (chain.previous.self().weapp) {
    //   bead.parsed = {
    //     code: new RawSource(compiledCode),
    //     rel: {}
    //   };
    //   return chain;
    // }

    let msg = xmllint.verify(compiledCode);
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

    let usingComponents =
      sfcConfig && sfcConfig.bead.parsed.code.meta() ? sfcConfig.bead.parsed.code.meta().usingComponents : {};

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
    return this.hookUnique('parse-template-main', chain);
  });
};
