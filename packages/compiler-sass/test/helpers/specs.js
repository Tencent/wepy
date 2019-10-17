const fs = require('fs');
const path = require('path');

const sassDir = path.resolve(__dirname, '../fixtures/sass/');

let tests = null;

const options = {
  'basic.scss': {
    json: {},
    string: [],
    resolve: {}
  },
  'alias.scss': {
    replace: [[/~@/g, '../sass/vars']],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../fixtures/sass/vars')
      }
    }
  }
};

exports = module.exports = {
  getIds() {
    if (tests) {
      return tests;
    }
    tests = fs.readdirSync(sassDir).filter(name => {
      let ext = path.extname(name);
      return name.indexOf('.tmp') === -1 && (ext === '.sass' || ext === '.scss');
    });
    return tests;
  },
  getId(id) {
    return options[id] || {};
  },
  getOpt(id) {
    return this.getId(id).json || {};
  },
  getResolveOpt(id) {
    return this.getId(id).resolve || {};
  },
  getReplacements(id) {
    return this.getId(id).replace || [];
  }
};
