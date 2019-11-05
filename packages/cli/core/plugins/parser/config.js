const path = require('path');
const loaderUtils = require('loader-utils');
const AppChain = require('../../compile/AppChain');
const PageChain = require('../../compile/PageChain');

let appUsingComponents = null;

exports = module.exports = function() {
  this.register('wepy-parser-config', function(chain) {
    const bead = chain.bead;
    const isApp = chain.previous instanceof AppChain;
    const isPage = chain.previous instanceof PageChain;

    let configString = bead.content.replace(/^\n*/, '').replace(/\n*$/, '');
    configString = (configString || '{}').trim();
    let config = null;
    try {
      let fn = new Function('return ' + configString);
      config = fn();
    } catch (e) {
      // TODO: added error handler code
      return Promise.reject(`invalid json: ${configString}`);
    }

    if (isApp) {
      config.component = true;
    }
    if (!config.usingComponents) {
      config.usingComponents = {};
    }

    let componentKeys = Object.keys(config.usingComponents);

    if (!appUsingComponents && componentKeys.length === 0) {
      bead.parsed = {
        output: config
      };
      return Promise.resolve(true);
    }
    // page Components will inherit app using components
    if (appUsingComponents && isPage) {
      appUsingComponents.forEach(comp => {
        // Existing in page components, then ignore
        // Resolve path for page components
        if (!config.usingComponents[comp.name] && comp.prefix === 'path') {
          const relativePath = path.relative(path.dirname(bead.path), comp.resolved.path);
          const parsedPath = path.parse(relativePath);
          // Remove wpy ext
          config.usingComponents[comp.name] = path.join(parsedPath.dir, parsedPath.name);
          componentKeys.push(comp.name);
        }
      });
    }

    let resolvedUsingComponents = {};
    let parseComponents = [];
    let plist = componentKeys.map(name => {
      const url = config.usingComponents[name];

      let prefix = 'path';
      // e.g.
      // plugins://appid/xxxdfdf
      // module:some-3rd-party-component
      let matchs = url.match(/([^:]+):(.+)/);
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

      return this.hookUnique(hookPrefix + hookName, name, prefix, source, target, chain).then(
        ({ name, prefix, resolved, target, npm }) => {
          if (hookName === 'raw') {
            resolvedUsingComponents[name] = url;
            parseComponents.push({
              name,
              prefix,
              url
            });
          } else {
            let relativePath = path.relative(path.dirname(bead.path), target);
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
        }
      );
    });

    return Promise.all(plist).then(() => {
      if (isApp) {
        appUsingComponents = parseComponents;
        delete config.usingComponents;
      } else {
        config.usingComponents = resolvedUsingComponents;
      }

      bead.parsed = {
        output: config,
        components: parseComponents
      };
      return chain;
    });
  });

  // eslint-disable-next-line
  this.register('wepy-parser-config-component-raw', function(name, prefix, source, target, chain) {
    return Promise.resolve({
      name,
      prefix
    });
  });

  this.register('wepy-parser-config-component-module', function(name, prefix, source, target, chain) {
    let contextDir = path.dirname(chain.bead.path);
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

  this.register('wepy-parser-config-component-path', function(name, prefix, source, target, chain) {
    const moduleRequest = loaderUtils.urlToRequest(source, source.charAt(0) === '/' ? '' : null);

    let contextDir = path.dirname(chain.bead.path);

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
};
