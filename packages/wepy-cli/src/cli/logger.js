import chalk from 'chalk';
import { format } from 'util';

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

export const log = (...args) => {
    const msg = format.apply(format, args);
    console.log(chalk.white(prefix), sep, msg);
};

/**
 * Log an error `message` to the console and exit.
 *
 * @param {String} message
 */

export const fatal = (...args) => {
    if (args[0] instanceof Error) args[0] = args[0].message.trim();
    const msg = format.apply(format, args);
    console.error(chalk.red(prefix), sep, msg);
    process.exit(1);
};

/**
 * Log a success `message` to the console and exit.
 *
 * @param {String} message
 */

export const success = (...args) => {
    const msg = format.apply(format, args);
    console.log(chalk.white(prefix), sep, msg);
};
