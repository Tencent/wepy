#!/usr/bin/env node

const chalk = require('chalk');

exports = module.exports = proj => {
  if (typeof proj !== 'string') proj = 'myproject';
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log(`deprecated command, please use ` + chalk.blue(`wepy init standard ${proj}`) + ` instead`);
  // eslint-disable-next-line no-console
  console.log('');
};
