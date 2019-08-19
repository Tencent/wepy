const fs = require('fs');
const loaderUtils = require('loader-utils');
const stylus = require('stylus');
const isModuleName = /^~[^/\\]+$/;
const trailingSlash = /[/\\]$/;

function createPlugin (compliation) {
  return function(style) {
    style.define('url', function() {
      const file = style.get('filename')
      const fileArrs = file.split('.')
      const fileExt = fileArrs.pop()
      const fileArrs1 = fileArrs[0].split('/')
      const fileName = fileArrs1.pop()

      let url;
      if (fileExt && !isModuleName.test(fileName)) {
        url = fileName + '.' + fileExt;
      } else {
        url = fileName;
      }
      const moduleRequest = loaderUtils.urlToRequest(
        url,
        url.charAt(0) === '/' ? '' : null
      );
      compliation.resolvers.normal.resolve({}, fileArrs1.join('/').replace(trailingSlash, ''), moduleRequest, {}).then(rst => {
        compliation.involved[rst.path] = 1;
        return stylus.url({ paths: [rst.path]})
      })
    });
  };
}

exports = module.exports = createPlugin;
