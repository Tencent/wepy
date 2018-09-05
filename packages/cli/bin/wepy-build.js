const compile = require('../core/compile');

exports = module.exports = (program) => {

  let compilation = compile(program);

  compilation.init().then((flag) => {
    compilation.start();
  }).catch(e => {
    compilation.logger.error('init', e.message);
  });

}
