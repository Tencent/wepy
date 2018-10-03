const fs = require('fs');
const path = require('path');
const cssNext = require('postcss-cssnext')

const postcssDir = path.resolve(__dirname, '../fixtures/postcss/');

let tests = null;

const options = {
  'basic': {
    json: {
      plugins: [
        cssNext()
      ]
    },
    string: [
    ],
    resolve: {
    }
  },
  'map': {
    json: {
      plugins: [
        cssNext()
      ],
      map: {
        inline: true
      }
    }
  }
}


exports = module.exports = {
  getIds () {
    if (tests) {
      return tests;
    }
    tests = fs.readdirSync(postcssDir).filter(name => path.extname(name) === '.postcss' && name.indexOf('.tmp') === -1).map(name => path.basename(name, '.postcss'));
    return tests;
  },
  getId (id) {
    return options[id] || {};
  },
  getOpt (id) {
    return this.getId(id).json || {};
  },
  getResolveOpt (id) {
    return this.getId(id).resolve || {};
  },
  getReplacements (id) {
    return (this.getId(id).replace || []);
  }
}
