const path = require('path');

exports = module.exports = function () {

  this.register('build-app', function buildApp (app) {

    this.logger.info('app', 'building App');

    let { script, styles, config } = app.sfc;

    let targetFile = path.join(this.context, this.options.target, 'app');

    config.outputCode = JSON.stringify(config.parsed.output, null, 4);

    this.hook('script-dep-fix', script.parsed);
    this.hook('script-injection', script.parsed, '{a: 1}');
    script.outputCode = script.parsed.source.source();

    let styleCode = '';

    styles.forEach(v => {
      styleCode += v.parsed.code + '\n';
    });

    styles.outputCode = styleCode;

    app.outputFile = targetFile;

    return app;

  });
};

