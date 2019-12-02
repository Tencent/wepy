const path = require('path');

exports = module.exports = function() {
  this.register('build-assets', function buildAssets() {
    this.logger.info('assets', 'building assets');

    let result = [];

    // this is a chain list, do it may have duplicates beads.
    // So may need a hashmap to store the beads who were writen in vendor
    let writeBeads = {};

    this.producer.asserts().forEach(item => {
      if (!writeBeads[item.bead.id]) {
        this.hook('script-dep-fix', item);

        let filepath = item.bead.path;
        let fileobj = path.parse(filepath);

        // For typescript, it should output .js
        if (item.bead.compiled.outputFileName && item.bead.compiled.outputFileName !== fileobj.base) {
          filepath = path.join(fileobj.dir, item.bead.compiled.outputFileName);
        }
        const targetFile = this.getTarget(filepath);
        result.push({
          src: item.bead.path,
          outputFile: targetFile,
          outputCode: item.bead.output(),
          encoding: item.bead.encoding
        });
      }
      writeBeads[item.bead.id] = true;
    });
    return result;
    /*
      let t = this.assets.type(file);
      let d = this.assets.data(file);

      if (!t.wxs && t.npm && t.dep && !t.component) {
        // do nothing, they are vendors
      } else if (!t.wxs && t.component && !t.dep) {
        // If it's a component and it's not a dependences
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
    */
  });
};
