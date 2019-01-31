#!/usr/bin/env node


const commander = require('commander');
const writePkg = require('write-pkg');

const autoPublish = require('./lib/auto');
const interactPublish = require('./lib/interact');
const isGitWorkTreeClean = require('./lib/check_repo_clean');


isGitWorkTreeClean().then(() => {
  commander.command('publish [name]')
  .option('-t, --tag <tag>', 'publish tag')
  .option('-v, --version <version>', 'publish version')
  .option('-q, --no-interact', 'with out interact')
  .action(function (name, opt) {
    name = name || '*';

    if (name !== '*') {
      if (opt.interact) {
        interactPublish(name, opt);
      } else {
        autoPublish(name, opt);
      }
    }
  });

  commander.parse(process.argv);
}).catch(e => {
  if (e.message === 'not clean') {
    console.error('ERR: Work tree is not clean, publish process stopped.');
  } else {
    console.error(e);
  }
})



