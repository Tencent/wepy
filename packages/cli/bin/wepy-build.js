const compile = require('../core/compile');
const parseOptions = require('../core/parseOptions');
const logger = require('../core/util/logger');

exports = module.exports = program => {
  let options;
  try {
    options = parseOptions.convert(program);
  } catch (e) {
    const msg = e.message;
    if (msg.indexOf('plugins expect a Array') > -1) {
      logger.error(`Parse WePY config failed. Are you trying to use WePY 2 to build WePY 1 project?`);
    } else {
      logger.error(`Parse WePY config failed.`);
    }
    logger.error(e.message);
    process.exit();
  }
  const compilation = compile(options || {});
  compilation.run().catch(e => {
    compilation.logger.error('init', e.message);
  });
};
