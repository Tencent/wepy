const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

/**
 *
 * Useage:
 * node ./scripts/npm-tags.js beta next
 */

const packages = fs.readdirSync(path.join(__dirname, '..', 'packages'));

function updateAllTag(oldTag, newTag) {
  packages.forEach(pkg => {
    updateOneTag(pkg, oldTag, newTag);
  });
}

function updateOneTag(pkg, oldTag, newTag) {
  process.env.FORCE_COLOR = 1;

  const npmPkgName = `@wepy/${pkg}`;

  const viewCmd = ['npm', 'view', npmPkgName, 'dist-tags.' + oldTag];

  console.log('EXEC: ' + viewCmd.join(' '));

  const res = spawnSync(viewCmd.shift(), viewCmd);

  const version = res.stdout.toString('utf-8').trim();

  console.log('OUTPUT: ' + version);

  const addCmd = ['npm', 'dist-tag', 'add', npmPkgName + '@' + version, newTag];

  console.log('EXEC: ' + addCmd.join(' '));

  const outputRes = spawnSync(addCmd.shift(), addCmd);

  const output = outputRes.stdout.toString('utf-8').trim();

  console.log('OUTPUT: ' + output);
}

// eslint-disable-next-line no-unused-vars
(function main([bin, file, ...args]) {
  updateAllTag.apply(null, args);
})(process.argv);
