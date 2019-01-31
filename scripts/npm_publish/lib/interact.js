const path = require('path');
const readPkg = require('read-pkg');
const semver = require('semver');
const chalk = require('chalk');
const { prompt, Select, Input } = require('enquirer');

const autoPublish = require('./auto');
const log = require('./log');

const PACKAGES_DIR = './packages/';

/*
 * interact publish a npm package
 */
module.exports = function interactPublish (name, opt) {

  let flow = Promise.resolve(name);

  if (name === '*') {
    const util = require('util');
    const fs = require('fs');
    const readdir = util.promisify(fs.readdir);


    flow = readdir(PACKAGES_DIR).then(dirs => {
      return dirs.filter(dir => fs.statSync(path.join(PACKAGES_DIR, dir)).isDirectory());
    }).then(dirs => {
      return new Select({
        name: 'package',
        message: 'Pick a package:',
        choices: dirs
      }).run();
    });
  }

  flow.then(name => {
    // Enter directory
    let cwd = path.join('packages', name);
    process.chdir(cwd);

    let pkg = readPkg.sync({ cwd: './' });
    let pkgVersion = pkg.version;

    log.info('Publish package: ' + chalk.cyan(pkg.name));

    let publishOpt = {
      version: opt.ver || '',
      tag: opt.tag || ''
    };

    return new Select({
      name: 'tag',
      message: 'Pick a tag:',
      choices: ['release', 'alpha', 'beta', 'custom']
    }).run().then(tag => {
      if (tag === 'custom') {
        return new Input({
          message: 'Input custom tag'
        }).run()
      }
      publishOpt.tag = tag;
      return tag;
    }).then(tag => {
      let choices = [];
      choices = ['patch', 'minor', 'major'].map(v => {
        if (tag !== 'release') {
          v = 'pre' + v;
        }
        let ver = semver.inc(pkgVersion, v, tag === 'release' ? '' : tag);
        return {
          message: `${v} (${ver})`,
          value: ver
        };
      });
      return new Select({
        name: 'version',
        message: 'Chooice a publish version:',
        choices: choices
      }).run();
    }).then((version) => {
      publishOpt.version = version;
      publishOpt.interact = true;
      return autoPublish(pkg, publishOpt);
    })
  }).catch((e) => {
    if (e !== '') { // Command + C cancelled the selection.
      log.error(e);
    }
  });
}
