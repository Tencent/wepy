const path = require('path');

exports = module.exports = function() {
  this.register('build-assets', function buildAssets() {
    this.logger.info('assets', 'building assets');

    let result = [];

    this.assets.array().forEach(file => {
      let t = this.assets.type(file);
      let d = this.assets.data(file);

      if (t.npm) {
        if (t.type === 'weapp') {
          if (!t.wxs && t.component) {
            // it's a npm weapp component, like vant-weapp.
            // output-components will generate the code for vant-weapp himself
            return;
          } else {
            // it's in weapp component, maybe they require a lib in the component
            // this will goes to build asserts.
          }
        } else if (!t.wxs && t.dep && !t.component) {
          // it's a vendor, will go to vendor build
          return;
        }
      } else {
        // it's a component and it's not a dependences
        if (!t.wxs && t.component && !t.dep) {
          return;
        }
      }
      ///////////////////
      // asserts build
      //////////////////
      if (!t.wxs && !t.url) {
        this.hook('script-dep-fix', d);
      }

      let filePath = file;
      let fileObj = path.parse(file);

      // For typescript, it should output .js
      if (d.outputFileName && d.outputFileName !== fileObj.base) {
        filePath = path.join(fileObj.dir, d.outputFileName);
      }

      let targetFile = t.npm ? this.getModuleTarget(filePath) : this.getTarget(filePath);
      result.push({
        src: file,
        targetFile: targetFile,
        outputCode: d.source.source(),
        encoding: d.encoding
      });
    });

    return result;
  });
};
