const path = require('path');

exports = module.exports = function() {
  this.register('build-components', function buildComponents(comps) {
    this.logger.info('component', 'building components');

    comps.forEach(comp => {
      let { script, config, template, wxs } = comp.sfc;

      let meta = config.bead.parsed.code.meta();

      meta.component = true;
      const { usingComponents, ...other } = meta;
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
      config.bead.parsed.code.meta({
        ...other,
        usingComponents: newUsingComponents
      });

      this.hook('script-dep-fix', script);
      /*
      if (!script.empty && !(comp.component && comp.type === 'weapp')) {
        this.hook('script-injection', script, template.bead.parsed.rel);
      }*/
      this.hook('script-injection', script, template.bead.parsed.rel);

      if (wxs && wxs.length) {
        let wxsCode = '';
        wxs.forEach(item => {
          wxsCode += item.bead.output() + '\n';
        });

        wxsCode = '<!--           wxs start           -->\n' + wxsCode + '<!--           wxs end             -->\n';

        template.bead.parsed.code.insert(0, wxsCode);
      }
      let targetFile = comp.self().npm ? this.getModuleTarget(comp.bead.path) : this.getTarget(comp.bead.path);
      let target = path.parse(targetFile);
      comp.bead.outputFile = path.join(target.dir, target.name);
    });

    return comps;
  });
};
