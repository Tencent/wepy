const path = require('path');


exports = module.exports = function () {

  this.register('build-pages', function buildPages (pages) {

    this.logger.info('page', 'building pages');

    pages.forEach(page => {
      let { script, styles, config, template } = page.sfc;

      let styleCode = '';
      styles.forEach(v => {
        styleCode += v.parsed.code + '\n';
      });

      config.outputCode = JSON.stringify(config.parsed, null, 4);

      this.hookSeq('script-dep-fix', script.parsed);
      this.hookSeq('script-injection', script.parsed, template.parsed.rel);

      script.outputCode = script.parsed.source.source();

      styles.outputCode = styleCode;
      template.outputCode = template.parsed.code;

      let targetFile = this.getTarget(page.file);
      let target = path.parse(targetFile);
      page.outputFile = path.join(target.dir, target.name);

    });

    return pages;
  });
};

