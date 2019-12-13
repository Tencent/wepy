exports = module.exports = function initParser(ins) {
  ['script', 'style', 'template', 'config', 'wxs', 'file'].forEach(k => {
    require('../plugins/parser/' + k).call(ins);
  });
};
