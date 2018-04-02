const path = require('path');
const fs = require('fs-extra');
const rollup = require('rollup');
const buble = require('rollup-plugin-buble');
const replace = require('rollup-plugin-replace');

const config = require('./config');

function build (config) {
  let output = config.output;
  let { file, banner } = output;

  return rollup.rollup(config).then(bundle => bundle.generate(output))
    .then(rst => {
      write(file, rst.code);
    })
    .catch(e => {
      console.log(e);
    })
}

function write (dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report (extra) {
      console.log(blue(path.relative(process.cwd(), dest)) + ' ' + getSize(code) + (extra || ''))
      resolve()
    }

    fs.outputFile(dest, code).then(() => {
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err)
            return reject(err);
          report(' (gzipped: ' + getSize(zipped) + ')')
        })
      } else {
        report();
      }
    }).catch(reject);
  })
}

function getSize (code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError (e) {
  console.log(e)
}

function blue (str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m'
}


let configs = config.getAllBuilds();

configs.forEach(config => {
  build(config);
});
