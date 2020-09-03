const semver = require('semver');
const execa = require('execa');
const { Select, Input } = require('enquirer');

/*
 * interact publish a npm package
 */
function interactPublish() {
  let flow = Promise.resolve();
  return flow
    .then(() => {
      let publishOpt = {
        version: '',
        tag: ''
      };

      const pkgVersion = require('../lerna.json').version;

      return new Select({
        name: 'tag',
        message: 'Pick a tag:',
        choices: ['release', 'alpha', 'beta', 'custom']
      })
        .run()
        .then(tag => {
          if (tag === 'custom') {
            return new Input({
              message: 'Input custom tag'
            }).run();
          }
          publishOpt.tag = tag;
          return tag;
        })
        .then(tag => {
          let choices = [];
          choices = ['patch', 'minor', 'major'].map(v => {
            if (tag !== 'release') {
              v = 'pre' + v;
            }
            let ver = semver.inc(pkgVersion, v, tag === 'release' ? '' : tag);
            return {
              message: `${v} (${ver})`,
              value: v
            };
          });
          if (tag !== 'release') {
            let prerelease = semver.inc(pkgVersion, 'prerelease', tag);
            choices.push({
              message: `prerelease (${prerelease})`,
              value: 'prerelease'
            });
          }
          return new Select({
            name: 'version',
            message: 'Chooice a publish version:',
            choices: choices
          }).run();
        })
        .then(version => {
          publishOpt.version = version;
          return publishOpt;
        });
    })
    .catch(e => {
      // eslint-disable-next-line
      console.log(e);
    });
}

interactPublish().then(opt => {
  let msg = `release: ${opt.version} release`;
  if (opt.tag) {
    msg += ` on ${opt.tag}`;
  }
  const cmds = ['git', 'commit', '-m', `"${msg}"`, '--allow-empty', '--no-verify'];

  execa(cmds.shift(), cmds).then(res => {
    // eslint-disable-next-line
    console.log(res.stdout);
  });
});
