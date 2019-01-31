const chalk = require('chalk');

module.exports = {
  info (msg) {
    console.log(chalk.yellow('⦿ ') + msg);
  },
  success (msg) {
    console.log(chalk.green('✔ ') + msg);
  },
  error (e) {
    console.log(chalk.red('✘ ') + e);
  }
}
