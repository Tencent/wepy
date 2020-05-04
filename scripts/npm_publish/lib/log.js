const chalk = require('chalk');

module.exports = {
  info(msg) {
    // eslint-disable-next-line no-console
    console.log(chalk.yellow('⦿ ') + msg);
  },
  success(msg) {
    // eslint-disable-next-line no-console
    console.log(chalk.green('✔ ') + msg);
  },
  error(e) {
    // eslint-disable-next-line no-console
    console.log(chalk.red('✘ ') + e);
  }
};
