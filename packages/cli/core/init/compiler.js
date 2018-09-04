exports = module.exports = function initCompiler (ins, compilers = {}) {
  let init = Object.keys(compilers).map(c => {
    let module;
    let moduleName = `wepy-compiler-${c}`;
    return ins.resolvers.context.resolve({}, ins.context, moduleName, {}).then(rst => {
      try {
        module = require(rst.path);
      } catch (e) {
        throw new Error(`Missing module ${moduleName}`);
      }
      return module(compilers[c]).call(ins);
    }).catch(e => {
      ins.logger.error('init', `Make sure module "${moduleName}" is installed. If not please try "npm install".`);
      throw e;
    });
  });
  return Promise.all(init);
};
