import semver from 'semver';
import request from 'request';
import chalk from 'chalk';
import pkgConfig from '../../package.json';

export default function checkVersion (done) {
  /**
   * 检测当前node版本是否符合要求
   */
    if (!semver.satisfies(process.version, pkgConfig.engines.node)) {
        return console.log(chalk.red(
      '  You must upgrade node to >=' + pkgConfig.engines.node + '.x to use wepy-cli'
    ));
    }
    request({
        url: 'https://registry.npmjs.org/wepy-cli',
        timeout: 1000
    }, (err, res, body) => {
        if (!err && res.statusCode === 200) {
            const latestVersion = JSON.parse(body)['dist-tags'].latest;
            const localVersion = pkgConfig.version;
            if (semver.lt(localVersion, latestVersion)) {
                console.log(chalk.yellow('  A newer version of wepy-cli is available.'));
                console.log();
                console.log('  latest:    ' + chalk.green(latestVersion));
                console.log('  installed: ' + chalk.red(localVersion));
                console.log();
            }
        }
        done();
    });
}