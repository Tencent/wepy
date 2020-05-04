const path = require('path');
const importsToResolve = require('./importsToResolve');

//const matchMalformedModuleFilename = /(~[^/\\]+)\.less$/;

function resolveImporter(compilation, file) {
  function doResolve(dir, imports) {
    if (imports.length === 0) {
      return Promise.reject();
    }
    return compilation.resolvers.normal.resolve({}, dir, imports[0], {}).then(resolved => {
      return { file: resolved.path };
    });
  }
  return function(url, prev, done) {
    let dir = path.dirname(prev === 'stdin' ? file : prev);

    doResolve(dir, importsToResolve(url))
      .then(done)
      .catch(() => ({ file: url }));
  };
}

exports = module.exports = resolveImporter;
