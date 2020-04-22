const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const tildify = require('tildify');
const inquirer = require('inquirer');
const home = require('user-home');
const rm = require('rimraf').sync;
const download = require('./cli/download');
const localPath = require('./cli/local-path');
const checkVersion = require('./cli/check-version');
const generate = require('./cli/generate');
const logger = require('./../util/logger');

exports = module.exports = (template, rawName, program) => {
  function gen(templatePath) {
    logger.verbose('Start to generate project');
    // eslint-disable-next-line no-console
    console.log();
    return new Promise((resolve, reject) => {
      return generate(name, templatePath, to, err => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    })
      .catch(e => {
        logger.error('Generate project failed');
        logger.error(e);
        return false;
      })
      .then(conti => {
        if (conti) {
          // eslint-disable-next-line no-console
          console.log();
          logger.info(`Generated "${name}".`);
        }
      });
  }

  function run() {
    if (localPath.isLocalPath(template)) {
      logger.verbose('Use local path template');
      // use local/cache template
      // Example:
      // wepy init E:\workspace\wepy_templates\standard my-wepy-project
      // wepy init standard my-wepy-project --offline
      const templatePath = localPath.getTemplatePath(template);
      if (fs.existsSync(templatePath)) {
        gen(templatePath);
      } else {
        logger.error(`Local template "${template}" not found.`);
      }
    } else {
      logger.verbose(`Version check`);
      checkVersion().then(() => {
        downloadAndGenerate(template);
      });
    }
  }

  function downloadLog(msg, type = 'verbose') {
    logger[type](msg);
  }

  function downloadOfficialTemplate(templateName, dist, opt, branch) {
    downloadLog(`Download template "${templateName}" in branch "${branch}" from Github Raw`);
    return download
      .downloadFromGitRaw(templateName, dist, opt, branch)
      .catch(e => {
        if (branch === '2.0.x') {
          downloadLog(`Download URL is: ${e.url}`);
          downloadLog(`Download from Github raw failed, try Tencent COS download`, 'warn');
          downloadLog(e, 'warn');
          return download.downloadFromCos(templateName, tmp, opt);
        } else {
          throw e;
        }
      })
      .catch(e => {
        downloadLog(`Download URL is: ${e.url}`);
        throw e;
      });
  }

  function downloadAndGenerate(template) {
    if (fs.existsSync(tmp)) {
      rm(tmp);
    }
    if (!hasSlash) {
      let [templateName, branch] = template.split('#');
      downloadLog(`Donwnloading template "${templateName}"`);
      return downloadOfficialTemplate(templateName, tmp, { extract: true }, branch || '2.0.x')
        .then(() => {
          downloadLog('Download success, start generate template');
          return true;
        })
        .catch(e => {
          if (e.statusCode === 404) {
            logger.error(`Unrecongnized template: "${template}". Try "wepy list" to show all available templates `);
          } else {
            logger.error(`Download template failed`);
            logger.error(e);
          }
          return false;
        })
        .then(conti => {
          if (conti) {
            return gen(tmp);
          }
        });
    } else {
      // use third party template
      downloadLog('Donwnloading github repo "${template}"');
      return download
        .downloadRepo(template, tmp, { clone })
        .then(() => {
          downloadLog('Download repository success, start generate template');
          return true;
        })
        .catch(e => {
          logger.error('Failed to download repo ' + template);
          logger.error(e);
          return false;
        })
        .then(conti => {
          if (conti) {
            return gen(tmp);
          }
        });
    }
  }

  const hasSlash = template.indexOf('/') > -1;
  const inPlace = !rawName || rawName === '.';
  const name = inPlace ? path.relative('../', process.cwd()) : rawName;
  const to = path.resolve(rawName || '.');
  const clone = program.clone || false;
  const offline = program.offline || false;

  let tmp = path.join(home, '.wepy_templates', template.replace(/\//g, '-'));

  /**
   * use offline cache
   */
  if (offline) {
    // eslint-disable-next-line no-console
    logger.notice(`Use cached template at ${chalk.yellow(tildify(tmp))}`);
    template = tmp;
  }

  if (fs.existsSync(to)) {
    inquirer
      .prompt([
        {
          type: 'confirm',
          message: inPlace ? 'Generate project in current directory?' : 'Target directory exists. Continue?',
          name: 'ok'
        }
      ])
      .then(answers => {
        if (answers.ok) {
          run();
        }
      })
      .catch();
  } else {
    run();
  }
};
