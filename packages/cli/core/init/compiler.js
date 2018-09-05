exports = module.exports = function initCompiler (ins, compilers = {}) {
  let init = Object.keys(compilers).map(c => {
    let module;
    let moduleName = `@wepy/compiler-${c}`;
    return ins.resolvers.context.resolve({}, ins.context, moduleName, {}).then(rst => {
      try {
        module = require(rst.path);
      } catch (e) {
        ins.logger.error('init', `Failed to load model "${moduleName}"`);
        ins.logger.error('init', e);
      }
      module && module(compilers[c]).call(ins);
      return module;
    }).catch(e => {
      ins.logger.error('init', `Make sure module "${moduleName}" is installed. If not please try "npm install ${moduleName} --save-dev".`);
      ins.logger.error('init', e);
    });
  });
  return Promise.all(init).then(compilers => {
    if (compilers.some(c => !c)) {
      throw new Error('Initialize failed');
    }
    return true;
  });
};
