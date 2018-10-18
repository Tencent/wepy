const path = require('path');


exports = module.exports = function () {

  this.register('build-assets', function buildAssets () {

    let result = [];
    let assets = this.assets;

    let requires = assets.array('require');
    let urls = assets.array('url');

    [].concat(requires, urls).forEach(file => {

      let fileData = this.assets.data(file);

      if (fileData.type !== 'url') {
        this.hookSeq('script-dep-fix', fileData);
      }
      let targetFile = this.getTarget(file);

      result.push({
        src: file,
        targetFile: targetFile,
        outputCode: fileData.source.source(),
        encoding: fileData.encoding
      });
    });

    return result;
  });

};

