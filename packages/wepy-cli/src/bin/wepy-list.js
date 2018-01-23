#!/usr/bin/env node

import chalk from 'chalk';
import request from 'request';

request({
    url: 'https://raw.githubusercontent.com/wepyjs/wepy_templates/master/templates.json',
    headers: {
        'User-Agent': 'wepy-cli'
    }
}, (err, res, body) => {
    const requestBody = JSON.parse(body);
    if (Array.isArray(requestBody)) {
        console.log('  Available official templates:\n');
        requestBody.forEach(repo => {
            console.log(
        '  ' + chalk.yellow('★') +
        '  ' + chalk.blue(repo.name) +
        ' - ' + repo.description);
        });
    } else {
        console.error(requestBody.message);
    }
});