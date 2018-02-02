#!/usr/bin/env node

import chalk from 'chalk';
import request from 'request';
import Table from 'tty-table';
import ta from 'time-ago';

exports = module.exports = (proj) => {
  if (typeof proj !== 'string')
    proj = 'myproject';
  console.log('');
  console.log(`deprecated command, please use ` + chalk.blue(`wepy init standard ${proj}`) + ` instead`);
  console.log('');
}
