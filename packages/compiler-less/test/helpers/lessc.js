const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const less = require('less');
const specs = require('./specs');

const lesscPath = require.resolve('.bin/lessc');

const projectPath = path.resolve(__dirname, '..', '..');
const fixturesPath = path.resolve(projectPath, 'test', 'fixtures');
const lessPath = path.resolve(fixturesPath, 'less');
const cssPath = path.resolve(fixturesPath, 'css');

// Ignore the fail test cases;
let ids = specs.getIds().filter(v => !/^fail-/.test(v));

ids.forEach(id => {
  const lessFile = path.join(lessPath, `${id}.less`);
  const css = path.join(cssPath, `${id}.css`);
  const tmpless = path.join(lessPath, `${id}.tmp.less`);

  let replaces = specs.getReplacements(id);

  let content = fs.readFileSync(lessFile, 'utf-8');

  replaces.forEach(r => {
    content = content.replace(r[0], r[1]);
  });
  fs.outputFileSync(tmpless, content);

  let options = specs.getLesscOpt(id);

  let relativeUrls = '--relative-urls';
  if (less.version[0] >= 3 && less.version[1] >= 8) {
    // https://github.com/less/less.js/blob/59e919b3fc968a403405e39cf15237936b1a6b46/bin/lessc#L479-L484
    relativeUrls = '--rewrite-urls=all';
  }
  let cmd = `${lesscPath} ${relativeUrls} ${options} ${tmpless} ${css}`;

  console.log(`Generate spec: ${id}`);

  exec(cmd, { cwd: projectPath }, (err, stdout, stderr) => {
    if (err || stdout || stderr) {
      err = err || new Error(stdout || stderr);
      throw err;
    }
    fs.removeSync(tmpless);
  });
});
