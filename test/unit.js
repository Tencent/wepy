const path = require('path');
const { spawnSync } = require('child_process');

const packages = [
  'babel-plugin-import-regenerator',
  'cli',
  //'compiler-babel',
  'compiler-less',
  'compiler-sass',
  //'compiler-stylus',
  //'compiler-typescript',
  'core',
  'plugin-define',
  //'plugin-eslint',
  //'plugin-uglifyjs',
  //'redux',
  'use-intercept',
  'use-promisify'
  //'x',
];

function testAll(pkgs) {
  if (pkgs.length === 0) {
    pkgs = packages;
  }
  pkgs.forEach(pkg => {
    testOne(pkg);
  });
}

function testOne(name) {
  process.env.FORCE_COLOR = 1;
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(command, ['run', 'test'], {
    cwd: path.join(process.cwd(), 'packages', name),
    env: process.env,
    stdio: 'inherit'
  });
  if (result.status !== 0) {
    throw new Error('Test cases failed in: ' + name);
  }
}

// eslint-disable-next-line no-unused-vars
(function main([bin, file, ...args]) {
  testAll(args);
})(process.argv);
