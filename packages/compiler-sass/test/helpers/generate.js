const path = require('path');
const sass = require('sass');
const fs = require('fs-extra');
const specs = require('./specs');

const projectPath = path.resolve(__dirname, '..', '..');
const fixturesPath = path.resolve(projectPath, 'test', 'fixtures');
const sassPath = path.resolve(fixturesPath, 'sass');
const cssPath = path.resolve(fixturesPath, 'css');

specs.getIds().forEach(id => {
  const ext = path.extname(id);
  const name = id.replace(new RegExp(ext + '$'), '');
  const sassFile = path.join(sassPath, id);
  const css = path.join(cssPath, `${id}.css`);
  const tmpsass = path.join(sassPath, `${name}.tmp${ext}`);

  let replaces = specs.getReplacements(id);

  let content = fs.readFileSync(sassFile, 'utf-8');

  replaces.forEach(r => {
    content = content.replace(r[0], r[1]);
  });
  fs.outputFileSync(tmpsass, content);

  let options = specs.getOpt(id);

  // eslint-disable-next-line
  console.log(`Generate spec: ${id}`);

  sass.render(
    {
      file: tmpsass,
      outFile: css,
      ...options
    },
    function(err, result) {
      if (err) {
        // eslint-disable-next-line
        console.log(err);
        return;
      }
      fs.outputFileSync(css, result.css.toString(), 'utf-8');
      fs.removeSync(tmpsass);
    }
  );
});
