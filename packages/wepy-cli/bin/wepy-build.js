const compile = require('../core/compile');

exports = module.exports = (program) => {

  let compilation = compile(program);

  compilation.start();

}