const path = require('path');


exports = module.exports = function () {

  this.register('build-components', function buildComponents (comps) {
    this.logger.info('component', 'building components');

    comps.forEach(comp => {
      let { script, styles, config, template } = comp.sfc;

      let styleCode = '';
      styles.forEach(v => {
        styleCode += v.parsed.css + '\n';
      });

      config.parsed.component = true;
      config.outputCode = JSON.stringify(config.parsed, null, 4);

      this.hookSeq('script-dep-fix', script.parsed);
      this.hookSeq('script-injection', script.parsed, template.rel);
       script.outputCode = script.parsed.source.source();
      styles.outputCode = styleCode;
      template.outputCode = template.parsed.code;

      let targetFile = this.getTarget(comp.file);
      let target = path.parse(targetFile);
      comp.outputFile = path.join(target.dir, target.name);
    });

    return comps;
  });
};

