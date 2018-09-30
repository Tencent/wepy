const path = require('path');
const loaderUtils = require('loader-utils');

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
      return Promise.resolve({
        output: config
      });
    }

    let resolvedUsingComponents = {};
    let parseComponents = [];
    Object.keys(config.usingComponents).forEach(name => {
      const url = config.usingComponents[name];

      let prefix = 'path';
      // e.g.
      // plugins://appid/xxxdfdf
      // module:some-3rd-party-component
      let matchs = url.match(/([^:]+)\:(.+)/);
      let request = url;

      if (matchs) {
        prefix = matchs[1];
        request = matchs[2];
      }

      let target = request;
      let source = request;

      ([ name, prefix, source, target ] = this.hookUniqueReturnArg('wepy-parser-config-component-' + prefix, name, prefix, source, target, ctx));
      let relativePath = path.relative(path.dirname(ctx.file), target);
      let parsedPath = path.parse(relativePath);
      resolvedUsingComponents[name] = path.join(parsedPath.dir, parsedPath.name);
      parseComponents.push({
        name: name,
        prefix: prefix,
        source: source,
        target: target,
        request: relativePath,
        type: parsedPath.ext === this.options.wpyExt ? 'wepy' : 'weapp'
      });
    });

    config.usingComponents = resolvedUsingComponents;
    return {
      output: config,
      components: parseComponents
    };
  });

  this.register('wepy-parser-config-component-module', function (name, prefix, source, target, ctx) {
    let contextDir = path.dirname(ctx.file);
    let modulePath = this.resolvers.normal.resolveSync({}, contextDir, source);

    return [ name, prefix, modulePath, this.getModuleTarget(modulePath, this.options.src), ctx ];
  });

  this.register('wepy-parser-config-component-path', function (name, prefix, source, target, ctx) {
    const moduleRequest = loaderUtils.urlToRequest(source, source.charAt(0) === '/' ? '' : null);

    let contextDir = path.dirname(ctx.file);
    let resolvedPath = this.resolvers.normal.resolveSync({}, contextDir, moduleRequest);
    let relativePath = path.relative(contextDir, resolvedPath);
    return [ name, prefix, resolvedPath, resolvedPath, ctx ];
  });

}
