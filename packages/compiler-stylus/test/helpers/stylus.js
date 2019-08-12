const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const specs = require('./specs');

const styluscPath = require.resolve('.bin/stylus');

const projectPath = path.resolve(__dirname, '..', '..');
const fixturesPath = path.resolve(projectPath, 'test', 'fixtures');
const stylusPath = path.resolve(fixturesPath, 'stylus');
const cssPath = path.resolve(fixturesPath, 'css');


// Ignore the fail test cases;
let ids = specs.getIds().filter(v => !/^fail-/.test(v));

ids.forEach(id => {
  const stylusFile = path.join(stylusPath, `${id}.styl`);
  const css = path.join(cssPath, `${id}.css`);
  const tmpstylus = path.join(stylusPath, `${id}.tmp.styl`);

  let replaces = specs.getReplacements(id);

  let content = fs.readFileSync(stylusFile, 'utf-8');

  replaces.forEach(r => {
    content = content.replace(r[0], r[1]);
  });
  fs.outputFileSync(tmpstylus, content);

  let options = specs.getStyluscOpt(id);

  const relativeUrls = '--resolve-url';
  let cmd = `${styluscPath} ${relativeUrls} ${options} ${tmpstylus} ${css}`;

  console.log(`Generate spec: ${id}`);

  exec(cmd, {cwd: projectPath}, (err, stdout, stderr) => {
    if (err || stderr) {
      err = err || new Error(stderr);
      throw err;
    }
    if (stdout) fs.removeSync(tmpstylus);
  });

});
