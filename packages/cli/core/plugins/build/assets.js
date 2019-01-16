const path = require('path');


exports = module.exports = function () {

  this.register('build-assets', function buildAssets () {

    this.logger.info('assets', 'building assets');

    let result = [];
    let assets = this.assets;

    this.assets.array().forEach(file => {
      let t = this.assets.type(file);
      let d = this.assets.data(file);

      if (t.npm && t.dep && !t.component) {
        // do nothing, they are vendors
      } else if (t.component && !t.dep) { // If it's a component and it's not a dependences
        // do nothing
      } else {
        if (!t.url) {
          this.hookSeq('script-dep-fix', d);
        }
        let targetFile = t.npm ? this.getModuleTarget(file) : this.getTarget(file);
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

