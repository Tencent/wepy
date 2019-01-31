#!/usr/bin/env node


const commander = require('commander');
const writePkg = require('write-pkg');

const autoPublish = require('./lib/auto');
const interactPublish = require('./lib/interact');
const isGitWorkTreeClean = require('./lib/check_repo_clean');
const log = require('./lib/log');


isGitWorkTreeClean().then(() => {
  commander.command('publish [name]')
  .option('-t, --tag <tag>', 'publish tag')
  .option('-v, --version <ver>', 'publish version')
  .option('-i, --increase <increase>', 'version increase')
  .option('-q, --no-interact', 'with out interact')
  .action(function (name, opt) {
    name = name || '*';

    if (opt.interact) {
      interactPublish(name, opt);
    } else {
      autoPublish(name, opt);
    }
  });

  commander.parse(process.argv);
}).catch(e => {
  log.error(e.message);
});



