#!/usr/bin/env node

import chalk from 'chalk'
import request from 'request'

request({
  url: 'https://api.github.com/repos/wepyjs/wepy_templates/contents/templates',
  headers: {
    'User-Agent': 'wepy-cli'
  }
}, (err, res, body) => {
  const requestBody = JSON.parse(body)
  if (Array.isArray(requestBody)) {
    console.log('  Available official templates:')
    console.log()
    requestBody.forEach(repo => {
      console.log(
        '  ' + chalk.yellow('★') +
        '  ' + chalk.blue(repo.name) +
        ' - ' + repo.description)
    })
  } else {
    console.error(requestBody.message)
  }
})