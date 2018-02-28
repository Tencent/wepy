const chalk = require('chalk');
const format = require('util').format;

/**
 * Prefix.
 */

const prefix = '   wepy-cli';
const sep = chalk.gray('·');

/**
 * Log a `message` to the console.
 *
 * @param {String} message
 */

exports = module.exports = {
    log (...args) {
        const msg = format.apply(format, args);
        console.log(chalk.white(prefix), sep, msg);
    },

    /**
     * Log an error `message` to the console and exit.
     *
     * @param {String} message
     */

    fatal (...args) {
        if (args[0] instanceof Error) args[0] = args[0].message.trim();
        const msg = format.apply(format, args);
        console.error(chalk.red(prefix), sep, msg);
        process.exit(1);
    },

    /**
     * Log a success `message` to the console and exit.
     *
     * @param {String} message
     */

    success (...args) {
        const msg = format.apply(format, args);
        console.log(chalk.white(prefix), sep, msg);
    }
};
