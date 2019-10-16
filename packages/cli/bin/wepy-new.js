#!/usr/bin/env node

const chalk = require('chalk');
const request = require('request');
const Table = require('tty-table');
const ta = require('time-ago');

exports = module.exports = proj => {
  if (typeof proj !== 'string') proj = 'myproject';
  console.log('');
  console.log(`deprecated command, please use ` + chalk.blue(`wepy init standard ${proj}`) + ` instead`);
  console.log('');
};
