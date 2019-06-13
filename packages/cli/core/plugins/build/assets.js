const path = require('path');


exports = module.exports = function () {

  this.register('build-assets', function buildAssets () {

    this.logger.info('assets', 'building assets');

    let result = [];
    let assets = this.assets;

    this.assets.array().forEach(file => {
      let t = this.assets.type(file);
      let d = this.assets.data(file);

      if (!t.wxs && t.npm && t.dep && !t.component) {
        // do nothing, they are vendors
      } else if (!t.wxs && t.component && !t.dep) { // If it's a component and it's not a dependences
        // do nothing
      } else {
        if (!t.wxs && !t.url) {
          this.hook('script-dep-fix', d);
        }

        let filepath = file;
        let fileobj = path.parse(file);

        // For typescript, it should output .js
        if (d.outputFileName && d.outputFileName !== fileobj.base) {
          filepath = path.join(fileobj.dir, d.outputFileName);
        }

        let targetFile = t.npm ? this.getModuleTarget(filepath) : this.getTarget(filepath);
        result.push({
          src: file,
          targetFile: targetFile,
          outputCode: d.source.source(),
          encoding: d.encoding
        });
      }
    });
    return result;
  });

};

