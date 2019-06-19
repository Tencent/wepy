const path = require('path');
const readPkg = require('read-pkg');
const writePkg = require('write-pkg');
const semver = require('semver');

const execa = require('execa');

const log = require('./log');


const githash = () => execa('git', ['rev-parse', '--short', 'HEAD']).then(rst => rst.stdout);

const gitadd = (files) => execa('git', ['add'].concat(files));

const gitcommit = (msg) => execa('git', ['commit', '-m', `${msg}` , '--no-verify']);

const gittag = (msg) => execa('git', ['tag', `${msg}`]);

const gitpush = () => execa('git', ['push']);

const gitpushtag = () => execa('git', ['push', '--tags']);

const publishParams = ['publish', '.', '--access=public']

const npmpublish = (tag) => execa('npm', tag ? publishParams.concat(['--tag', tag]) : publishParams);

/*
 * auto publish a npm package
 */
module.exports = function autoPublish (nameOrPkg, opt) {

  let pkg;
  if (!opt.interact) {
    if (!opt.name) {
      log.error('Missing a package name');
      return;
    }
    if (!opt.ver && !opt.increase) {
      log.error('You have to set a version or a increase');
      return;
    }
  }

  if (typeof nameOrPkg === 'string') {
    // Enter directory
    let cwd = path.join('packages', nameOrPkg);
    process.chdir(cwd);
    pkg = readPkg.sync({ cwd: './' });
  } else {
    pkg = nameOrPkg;
  }

  // Only give a increase
  if (!opt.interact && opt.increase && !opt.ver) {
    opt.ver = opt.tag ? semver.inc(pkg.version, opt.increase, opt.tag) : semver.inc(pkg.version, opt.increase);
  }

  return githash().then(hash => {
    let id = `${pkg.name}@${opt.ver}`;
    log.info('Writing package.json');
    return writePkg(Object.assign({}, pkg, { version: opt.ver, _id: id, _commitid: hash })).then(() => {
      log.info('Tag: ' + id);
      gitadd('package.json').then(() => {
        return gitcommit('release: ' + id);
      }).then(() => {
        return gittag(id);
      }).then(() => {
        return gitpush();
      }).then(() => {
        return gitpushtag();
      }).then(() => {
        log.info('Pushing to npm');
        if (opt.tag && opt.tag !== 'release') {
          return npmpublish(opt.tag);
        } else {
          return npmpublish();
        }
      }).then(() => {
        log.success('done');
        return true;
      });
    });
  }).catch(e => {
    log.error(e);
  });
}
