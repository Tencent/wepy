const path = require('path');


exports = module.exports = function () {

  this.register('build-assets', function buildAssets () {

    let filelist = this.assets.array('require');

    let result = {};

    return filelist.map(file => {

      let fileData = this.assets.data(file);

      this.hookSeq('script-dep-fix', fileData);

      let targetFile = this.getTarget(file);

      return {
        src: file,
        targetFile: targetFile,
        outputCode: fileData.source.source()
      };
    });
  });

};

