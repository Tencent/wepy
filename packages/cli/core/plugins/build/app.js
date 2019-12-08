const path = require('path');

exports = module.exports = function() {
  this.register('build-app', function buildApp(chain) {
    this.logger.info('app', 'building App');

    let { script } = chain.sfc;

    let targetFile = path.join(this.context, this.options.target, 'app');

    this.hook('script-dep-fix', script);
    this.hook('script-injection', script, this.options.appConfig);

    chain.bead.outputFile = targetFile;

    return chain;
  });
};
