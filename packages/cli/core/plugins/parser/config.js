const path = require('path');
const loaderUtils = require('loader-utils');

let appUsingComponents = null;

exports = module.exports = function () {
  this.register('wepy-parser-config', function (rst, ctx) {
    // If file is not changed, then use cache.
    if (ctx.useCache && ctx.sfc.config.parsed) {
      return Promise.resolve(true);
    }

    if (!rst) {
      if (!appUsingComponents) {
        return Promise.resolve(true);
      } else {
        rst.content = JSON.stringify({});
      }
    }

    let configString = rst.content.replace(/^\n*/, '').replace(/\n*$/, '');
    configString = (configString || '{}').trim();
    let config = null;
    try {
      let fn = new Function('return ' + configString);
      config = fn();
    } catch (e) {
      // TODO: added error handler code
      return Promise.reject(`invalid json: ${configString}`);
    }
    if (ctx.type !== 'app') { // app.json does not need it
      config.component = true;
    }
    let componentKeys = config.usingComponents ? Object.keys(config.usingComponents) : [];

    if (!appUsingComponents && componentKeys.length === 0) {
      ctx.sfc.config.parsed = {
        output: config
      };
      return Promise.resolve(true);
    }

    let resolvedUsingComponents = {};
    let parseComponents = [];
    let plist = componentKeys.map(name => {
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

      let hookPrefix = 'wepy-parser-config-component-';
      let hookName = prefix;

      if (!this.hasHook(hookPrefix + hookName)) {
        hookName = 'raw';
      }

      return this.hookUnique(hookPrefix + hookName, name, prefix, source, target, ctx).then(({ name, prefix, resolved, target, npm }) => {
        if (hookName === 'raw') {
          resolvedUsingComponents[name] = url;
          parseComponents.push({
            name,
            prefix,
            url,
          });
        } else {
          let relativePath = path.relative(path.dirname(ctx.file), target);
          let parsedPath = path.parse(relativePath);
          resolvedUsingComponents[name] = path.join(parsedPath.dir, parsedPath.name);
          parseComponents.push({
            name,
            prefix,
            resolved,
            path: resolved.path,
            target,
            npm,
            request: relativePath,
            type: parsedPath.ext === this.options.wpyExt ? 'wepy' : 'weapp'
          });
        }
      });
    });

    return Promise.all(plist).then(() => {
      if (ctx.type === 'app') {
        appUsingComponents = parseComponents;
        delete config.usingComponents;
      } else if (ctx.type === 'page'
        || (ctx.component && (ctx.type === 'wepy' || ctx.type === 'weapp'))) {
        config.usingComponents = resolvedUsingComponents;
        if (appUsingComponents) {
          appUsingComponents.forEach(comp => {
            // Existing in page components, then ignore
            // Resolve path for page components
            if (!config.usingComponents[comp.name] && comp.prefix === 'path') {
              const relativePath = path.relative(path.dirname(ctx.file), comp.resolved.path);
              const parsedPath = path.parse(relativePath);
              // Remove wpy ext
              config.usingComponents[comp.name] = path.join(parsedPath.dir, parsedPath.name);
            }
          });
        }
      }
      ctx.sfc.config.parsed = {
        output: config,
        components: parseComponents
      };
      return true;
    });
  });

  this.register('wepy-parser-config-component-raw', function (name, prefix, source, target, ctx) {
    return Promise.resolve({
      name,
      prefix,
    });
  });

  this.register('wepy-parser-config-component-module', function (name, prefix, source, target, ctx) {
    let contextDir = path.dirname(ctx.file);
    let modulePath = this.resolvers.normal.resolveSync({}, contextDir, source);

    return this.resolvers.normal.resolve({}, contextDir, source, {}).then(resolved => {
      return {
        name: name,
        prefix: prefix,
        resolved: resolved,
        target: this.getModuleTarget(resolved.path, this.options.src),
        npm: resolved.meta.descriptionFileRoot !== this.context
      };
    });
  });

  this.register('wepy-parser-config-component-path', function (name, prefix, source, target, ctx) {
    const moduleRequest = loaderUtils.urlToRequest(source, source.charAt(0) === '/' ? '' : null);

    let contextDir = path.dirname(ctx.file);
    let resolvedPath = this.resolvers.normal.resolveSync({}, contextDir, moduleRequest);
    let relativePath = path.relative(contextDir, resolvedPath);

    return this.resolvers.normal.resolve({}, contextDir, moduleRequest, {}).then(resolved => {
      return {
        name: name,
        prefix: prefix,
        resolved: resolved,
        target: resolved.path,
        npm: resolved.meta.descriptionFileRoot !== this.context
      };
    });
  });

}
