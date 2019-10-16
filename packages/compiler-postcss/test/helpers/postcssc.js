const path = require('path');
const postcss = require('postcss');
const fs = require('fs-extra');
const specs = require('./specs');

const projectPath = path.resolve(__dirname, '..', '..');
const fixturesPath = path.resolve(projectPath, 'test', 'fixtures');
const postcssPath = path.resolve(fixturesPath, 'postcss');
const cssPath = path.resolve(fixturesPath, 'css');

let ids = specs.getIds();

ids.forEach(id => {
  const postcssfile = path.join(postcssPath, `${id}.postcss`);
  const css = path.join(cssPath, `${id}.css`);
  let content = fs.readFileSync(postcssfile, 'utf-8');

  let options = specs.getOpt(id);

  console.log(`Generate spec: ${id}`);
  const { plugins = [], ...other } = options;
  postcss(plugins)
    .process(content, {
      from: postcssfile,
      ...other
    })
    .then(function(result) {
      fs.outputFileSync(css, result.css.toString(), 'utf-8');
    })
    .catch(function(err) {
      console.log(err);
      return;
    });
});
