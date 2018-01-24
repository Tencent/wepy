#!/usr/bin/env node

import chalk from 'chalk';
import request from 'request';

request({
    url: 'https://raw.githubusercontent.com/wepyjs/wepy_templates/master/templates.json',
    headers: {
        'User-Agent': 'wepy-cli'
    }
}, (err, res, body) => {
    if (body.message) {
        console.error(body.messge);
    }
    try {
        body = JSON.parse(body);
    } catch (e) {
        console.error('Something wrong with your network');
    }
    if (Array.isArray(body)) {
        console.log('  Available official templates:\n');
        body.forEach(repo => {
            console.log(
        '  ' + chalk.yellow('★') +
        '  ' + chalk.blue(repo.name) +
        ' - ' + repo.description);
        });
        console.log('\n');
    }
});
