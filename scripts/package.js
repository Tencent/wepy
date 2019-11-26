#!/usr/bin/env node

const path = require('path');
const execa = require('execa');

const packagesDir = path.join(process.cwd(), 'packages');

function readPkg(name) {
  return require(path.join(packagesDir, name, 'package.json'));
}

function viewChanges(name) {
  const pkg = readPkg(name);
  const tag = `${pkg.name}@${pkg.version}`;
  const rst = {
    dir: name,
    name: pkg.name,
    tag
  };
  return execa('/bin/sh', [
    '-c',
    `git log ${tag}..@ --oneline --pretty="format:" --name-status | grep packages/${name}`
  ])
    .then(res => {
      const lines = res.stdout.split('\n');
      return lines.map(line => {
        const arr = line.split('\t');
        return {
          status: arr[0],
          file: arr[1]
        };
      });
    })
    .catch(() => {
      return [];
    })
    .then(res => {
      rst.changes = res;
      return rst;
    });
}

function output(json) {
  /* eslint-disable */
  console.log(json.dir);
  console.log('  name: ' + json.name);
  console.log('  tag: ' + json.tag);
  console.log('  file changed count: ' + json.changes.length);
  console.log('  file changed list: ' + json.changes.length);
  json.changes.forEach(c => {
    console.log('    ' + c.status + ' ' + c.file);
  });
  /* eslint-enable */
}

const packageName = process.argv[2];

if (packageName) {
  viewChanges(packageName).then(output);
} else {
  const fs = require('fs');
  const dirs = fs.readdirSync(packagesDir);
  const jobs = dirs
    .filter(dir => {
      if (dir.startsWith('.')) {
        return false;
      }
      if (fs.statSync(path.join(packagesDir, dir)).isDirectory()) {
        return true;
      }
      return false;
    })
    .map(dir => {
      return viewChanges(dir).then(output);
    });

  Promise.all(jobs).then(() => {});
}
