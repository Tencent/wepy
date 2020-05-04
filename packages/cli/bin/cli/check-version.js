const semver = require('semver');
const request = require('request');
const chalk = require('chalk');
const pkgConfig = require('../../package.json');

exports = module.exports = function checkVersion() {
  /**
   * 检测当前node版本是否符合要求
   */
  return new Promise((resolve, reject) => {
    if (!semver.satisfies(process.version, pkgConfig.engines.node)) {
      // eslint-disable-next-line no-console
      reject(new Error('  You must upgrade node to >=' + pkgConfig.engines.node + '.x to use @wepy/cli'));
      return;
    }
    request(
      {
        url: 'https://registry.npmjs.org/@wepy/cli',
        timeout: 1000
      },
      (err, res, body) => {
        if (!err && res.statusCode === 200) {
          const latestVersion = JSON.parse(body)['dist-tags'].latest;
          const localVersion = pkgConfig.version;
          if (semver.lt(localVersion, latestVersion)) {
            /* eslint-disable no-console */
            console.log(chalk.yellow('  A newer version of @wepy/cli is available.'));
            console.log();
            console.log('  latest:    ' + chalk.green(latestVersion));
            console.log('  installed: ' + chalk.red(localVersion));
            console.log();
            /* eslint-enable no-console */
          }
        }
        resolve(true);
      }
    );
  });
};
