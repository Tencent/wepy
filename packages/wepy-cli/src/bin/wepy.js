
import program from 'commander'

program
  .version(require('../../package.json').version)
  .usage('<command> [options]')
  .command('init', 'generate a new project from a template')
  .command('build', 'build your project')
  .command('list', 'list available official templates')
  .command('upgrade', 'upgrade to the latest version')
  .parse(process.argv)
