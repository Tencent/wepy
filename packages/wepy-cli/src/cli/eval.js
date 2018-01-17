import chalk from 'chalk'

/**
 * Evaluate an expression in meta.json in the context of
 * prompt answers data.
 */

export default function evaluate (exp, data) {
  const fn = new Function('data', 'with (data) { return ' + exp + '}')
  try {
    return fn(data)
  } catch (e) {
    console.error(chalk.red('Error when evaluating filter condition: ' + exp))
  }
}