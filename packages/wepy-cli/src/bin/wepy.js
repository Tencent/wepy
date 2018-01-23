
import program from 'commander';

program
    .version(require('../../package.json').version, '-v, --version')
    .usage('<command> [options]');

program
    .command('init <template-name> [project-name]')
    .description('generate a new project from a template')
    .action(() => {
        require('./wepy-init');
    });

program
    .command('build')
    .description('build your project')
    .action(() => {
        require('./wepy-build');
    });

program
    .command('list')
    .description('list available official templates')
    .action(() => {
        require('./wepy-list');
    });

program
    .command('upgrade')
    .description('upgrade to the latest version')
    .action(() => {
        require('./wepy-upgrade');
    });

program.parse(process.argv);
