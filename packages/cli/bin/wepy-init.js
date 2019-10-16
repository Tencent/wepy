const fs = require('fs');
const path = require('path');
const ora = require('ora');
const chalk = require('chalk');
const tildify = require('tildify');
const inquirer = require('inquirer');
const home = require('user-home');
const rm = require('rimraf').sync;
const download = require('./cli/download');
const localPath = require('./cli/local-path');
const checkVersion = require('./cli/check-version');
const generate = require('./cli/generate');
const logger = require('./cli/logger');

exports = module.exports = (template, rawName, program) => {
  function gen(templatePath) {
    generate(name, templatePath, to, err => {
      if (err) logger.fatal(err);
      console.log();
      logger.success('Generated "%s".', name);
    });
  }

  function run() {
    if (localPath.isLocalPath(template)) {
      // use local/cache template
      // Example:
      // wepy init E:\workspace\wepy_templates\standard my-wepy-project
      // wepy init standard my-wepy-project --offline
      const templatePath = localPath.getTemplatePath(template);
      if (fs.existsSync(templatePath)) {
        gen(templatePath);
      } else {
        logger.fatal('Local template "%s" not found.', template);
      }
    } else {
      checkVersion(() => {
        downloadAndGenerate(template);
      });
    }
  }

  function downloadAndGenerate(template) {
    const spinner = ora('downloading template');
    spinner.start();

    if (fs.existsSync(tmp)) {
      rm(tmp);
    }

    if (!hasSlash) {
      // use official template
      download
        .downloadOfficialZip(template, tmp, { extract: true })
        .then(() => {
          spinner.stop();
          gen(tmp);
        })
        .catch(e => {
          if (e.statusCode === 404) {
            logger.fatal(`Unrecongnized template: "${template}". Try "wepy list" to show all available templates `);
          } else if (e) {
            logger.fatal('Failed to download repo ' + template + ': ' + e.message.trim());
          }
        });
    } else {
      // use third party template
      download.downloadRepo(template, tmp, { clone }, err => {
        spinner.stop();
        if (err) logger.fatal('Failed to download repo ' + template + ': ' + err.message.trim());
        gen(tmp);
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
    console.log(`> Use cached template at ${chalk.yellow(tildify(tmp))}`);
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
