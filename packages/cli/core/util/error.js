const codeFrameColumns = require('@babel/code-frame').codeFrameColumns;
const logger = require('./logger');

exports = module.exports = {
  warn(msg, file, codeFrame, location) {
    logger.warn(msg);
    logger.warn(file);
    const result = codeFrameColumns(codeFrame, location, {
      /* options */
    });
    console.log(result);
  },
  error(msg, file, codeFrame, location) {
    logger.warn(msg);
    logger.warn(file);
    const result = codeFrameColumns(codeFrame, location, {
      /* options */
    });
    console.log(result);
    process.exit();
  }
};
