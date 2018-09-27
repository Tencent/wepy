const path = require('path');
const loaderUtils = require('loader-utils');

const pluginRE = /plugin\:/;


exports = module.exports = function () {
  this.register('wepy-parser-config', function (rst, ctx) {
    let configString = rst.content.replace(/^\n*/, '').replace(/\n*$/, '');
    configString = configString || '{}';
    let config = null;
    try {
      let fn = new Function('return ' + configString);
      config = fn();
    } catch (e) {
      return Promise.reject(`invalid json: ${configString}`);
    }
    config.component = true;
    config.usingComponents = config.usingComponents || {};

    let componentKeys = Object.keys(config.usingComponents);

    if (componentKeys.length === 0) {
      return Promise.resolve(config);
    }

    // Getting resolved path for usingComponents

    let resolved = Object.keys(config.usingComponents).map(comp => {
      const url = config.usingComponents[comp];
      if (pluginRE.test(url)) {
        return Promise.resolve([comp, url]);
      }
      const moduleRequest = loaderUtils.urlToRequest(url, url.charAt(0) === '/' ? '' : null);
      return this.resolvers.normal.resolve({}, path.dirname(ctx.file), moduleRequest, {}).then(rst => {
        let parsed = path.parse(rst.path);
        let fullpath = path.join(parsed.dir, parsed.name); // remove file extention
        let relative = path.relative(path.dirname(ctx.file), fullpath);
        return [comp, relative];
      });
    });

    return Promise.all(resolved).then(rst => {
      rst.forEach(item => {
        config.usingComponents[item[0]] = item[1];
      });
      return config;
    });
  });
}
