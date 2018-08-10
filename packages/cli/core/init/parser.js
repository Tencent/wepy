exports = module.exports = function initParser (ins) {
  ['wpy', 'script', 'style', 'template', 'config'].forEach(k => {
    require('../plugins/parser/' + k).call(ins);
  });
};
