const path = require('path');
const fs = require('fs-extra');
const { promisify } = require('util');
const { isArr } = require('../../util/tools');
const logger = require('../../util/logger');

function output(chain) {
  let info = getOutputInfo(chain);
  if (!isArr(info)) {
    info = [info];
  }
  return Promise.all(
    info
      .filter(item => !!item)
      .map(item => {
        return this.hookAsyncSeq('output-file', { filename: item.filename, code: item.code, encoding: item.encoding })
          .then(({ filename, code, encoding }) => {
            if (!filename) {
            }
            if (!code) {
              logger.silly('output', 'empty content: ' + filename);
            } else {
              logger.silly('output', 'write file: ' + filename);
              return promisify(fs.outputFile)(filename, code, encoding || 'utf-8');
            }
          })
          .catch(e => {
            if (e.handler) {
              this.hookUnique('error-handler', e.handler, e.error, e.pos);
            } else {
              // TODO
              throw e;
            }
          });
      })
  );
}

function getOutputInfo(chain) {
  let filename, code, encoding;

  if (chain.sfc) {
    const sfc = chain.sfc;
    const outputMap = {
      script: 'js',
      styles: 'wxss',
      config: 'json',
      template: 'wxml'
    };

    return Object.keys(outputMap).map(k => {
      const filename = chain.bead.outputFile + '.' + outputMap[k];
      let code;
      if (isArr(sfc[k])) {
        code = sfc[k].map(c => c.bead.output()).join('\n');
      } else {
        // App do not have template
        if (!sfc[k]) {
          return false;
        } else {
          code = sfc[k].bead.output();
        }
      }
      return { filename, code, encoding };
    });
  } else {
    // It's vendor
    if (!chain.bead && chain.outputCode) {
      return { filename: chain.outputFile, code: chain.outputCode, encoding: chain.encoding };
    } else {
      filename = chain.bead.outputFile;
      code = chain.bead.output();
      encoding = chain.encoding;
      return { filename, code, encoding };
    }
  }
}

exports = module.exports = function() {
  ['output-app', 'output-pages', 'output-components'].forEach(k => {
    this.register(k, data => {
      if (!isArr(data)) data = [data];

      data.forEach(v => output.bind(this)(v));
    });
  });

  this.register('output-vendor', data => {
    return data.ignore && output.bind(this)(data, 'vendor');
  });

  this.register('output-assets', list => {
    return Promise.all(list.map(file => output.bind(this)(file, 'assets')));
  });

  this.register('output-static', () => {
    let paths = this.options.static;
    let copy = p => {
      let relative = path.relative(path.join(this.context, this.options.src), path.join(this.context, p));
      const target = path.join(this.context, p);
      if (fs.existsSync(target)) {
        if (fs.lstatSync(target).isDirectory() || fs.lstatSync(target).isFile()) {
          const dest = path.join(this.context, this.options.target, relative[0] === '.' ? p : relative);
          return fs.copy(target, dest);
        } else {
          this.logger.warn('output-static', `Path should be a directory or file: ${target}`);
        }
      }
      return Promise.resolve(true);
    };
    if (typeof paths === 'string') return copy(paths);
    else if (isArr(paths)) return Promise.all(paths.map(p => copy(p)));
  });
};
