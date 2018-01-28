#!/usr/bin/env node

import chalk from 'chalk';
import request from 'request';
import Table from 'tty-table';
import ta from 'time-ago';

exports = module.exports = (program) => {
    request({
        url: 'https://raw.githubusercontent.com/wepyjs/wepy_templates/master/templates.json',
        headers: {
            'User-Agent': 'wepy-cli'
        }
    }, (err, res, body) => {
        if (!body) {
            console.error('Something wrong with your network');
            return;
        }
        if (body.message) {
            console.error(body.messge);
            return;
        }
        let official, github;
        try {
            body = JSON.parse(body);
            official = body.official;
            github = body.github;
        } catch (e) {
            console.error('Something wrong with your network');
        }
        if (!program.github && Array.isArray(official)) {
            console.log('\n  Available official templates:\n');
            /*
            official.forEach(repo => {

              console.log(
            '  ' + chalk.yellow('♚') +
            '  ' + chalk.blue(repo.name) +
            ' - ' + repo.description);
            });
            */
            let tableHead = [
                {
                    value: 'Name',
                    width: 20,
                    color: 'blue'
                },
                {
                    value: 'Description',
                    width: 60,
                    align: 'left',
                    paddingLeft: 2,
                    key: 'description'
                }
            ];
            let rows = [];
            official.forEach(repo => {
              rows.push([repo.name, repo.description]);
            });

            let offical = Table(tableHead, rows, {
                borderStyle: 2
            });
            console.log(`     e.g., wepy init ${rows[0][0]} myproject`);
            console.log(offical.render());
        }
        if (Array.isArray(github)) {
            console.log('\n  Available github projects:\n');

            let tableHead = [
                {
                    value: 'Repository',
                    width: 30,
                    color: 'blue',
                    key: 'repo'
                },
                {
                    value: 'Stars',
                    width: 8,
                    key: 'star'
                },
                {
                    value: 'Description',
                    width: 60,
                    align: 'left',
                    paddingLeft: 2,
                    key: 'description'
                },
                {
                    value: 'Last Updated',
                    width: 25,
                    key: 'last_update',
                    formatter: function (v) {
                        let date = new Date(v);
                        if (date.toString() === 'Invalid Date') {
                            return '----';
                        } else {
                            return ta.ago(v);
                        }
                    }
                }
            ];

            let map = tableHead.map(v => v.key);

            let showItems = [];
            let rows = [];
            let MAX_COUNT = program.github ? 0 : 5;
            if (MAX_COUNT && github.length > MAX_COUNT) {
                for (let i = 0, l = github.length; i < l; i++) {
                    if (i >= MAX_COUNT)
                        break;
                    showItems.push(github[i]);
                }
            } else {
                showItems = github;
            }
            showItems.forEach(repo => {
                let row = [];
                map.forEach((title, i) => {
                    row.push(repo[title] || '');
                });
                rows.push(row);
            });
            if (MAX_COUNT && github.length > MAX_COUNT) {
                rows.push(['....', '..', '....', '....']);
            }

            let githubTable  = Table(tableHead, rows, {
                borderStyle: 2
            });
            console.log(`     e.g., wepy init ${rows[0][0]} myproject`);
            console.log(githubTable.render());

            if (MAX_COUNT && github.length > MAX_COUNT) {
                console.log(chalk.gray(`  use 'wepy list --github' to see all github projects`));
            }
            if (program.github) {
                console.log(chalk.gray(`  You can registe your project from here: https://github.com/wepyjs/wepy_templates`));
            }
            console.log('\n');
        }
    });
}
