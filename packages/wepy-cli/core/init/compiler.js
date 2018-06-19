exports = module.exports = function initCompiler (ins, compilers = {}) {
  let init = Object.keys(compilers).map(c => {
    let module;
    return ins.resolvers.context.resolve({}, ins.context, 'wepy-compiler-' + c, {}).then(rst => {
      module = require(rst.path);
      module(compilers[c]).call(ins);
    }).catch(e => {
      ins.logger.error(e);
    });
  });
  return Promise.all(init);
};
