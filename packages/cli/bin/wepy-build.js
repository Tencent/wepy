const compile = require('../core/compile');
const parseOptions = require('../core/parseOptions');

exports = module.exports = program => {
  const options = parseOptions.convert(program);
  const compilation = compile(options);

  compilation.run().catch(e => {
    compilation.logger.error('init', e.message);
  });
};
