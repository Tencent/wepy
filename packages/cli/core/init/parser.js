exports = module.exports = function initParser(ins) {
  ['wpy', 'script', 'style', 'template', 'config', 'component', 'wxs', 'file'].forEach(k => {
    require('../plugins/parser/' + k).call(ins);
  });
};
