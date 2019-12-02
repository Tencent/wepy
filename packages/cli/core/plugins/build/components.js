const path = require('path');

exports = module.exports = function() {
  this.register('build-components', function buildComponents(comps) {
    this.logger.info('component', 'building components');

    comps.forEach(comp => {
      let { script, config, template, wxs } = comp.sfc;

      config.bead.parsed.source.component = true;
      const { usingComponents, ...other } = config.bead.parsed.source;
      let newUsingComponents = {};
      /**
       * 在windows环境中解析的usingComponent格式为
       * usingComponent: {
       *  test: '..\..\test'
       * }
       * 需要转换成
       * usingComponent: {
       *  test: '../../test'
       * }
       */
      for (let i in usingComponents) {
        newUsingComponents[i] = './' + usingComponents[i].replace(/\\/g, '/');
      }
      config.bead.parsed.source = {
        ...other,
        usingComponents: newUsingComponents
      };
      this.hook('script-dep-fix', script);
      if (!script.empty && !(comp.component && comp.type === 'weapp')) {
        this.hook('script-injection', script, template.bead.parsed.rel);
      }

      if (wxs && wxs.length) {
        let wxsCode = '';
        wxs.forEach(item => {
          wxsCode += item.parsed.output + '\n';
        });
        template.outputCode =
          '<!----------   wxs start ----------->\n' +
          wxsCode +
          '<!----------   wxs end   ----------->\n' +
          template.outputCode;
      }
      let targetFile = comp.self().npm ? this.getModuleTarget(comp.bead.path) : this.getTarget(comp.bead.path);
      let target = path.parse(targetFile);
      comp.bead.outputFile = path.join(target.dir, target.name);
    });

    return comps;
  });
};
