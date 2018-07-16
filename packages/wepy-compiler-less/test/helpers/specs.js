const fs = require('fs');
const path = require('path');

const lessDir = path.resolve(__dirname, '../fixtures/less/');

let tests = null;

const options = {
  basic: {
    json: {
    },
    string: [
    ],
    resolve: {
    }
  },
  alias: {
    replace: [
      [/~@/g, '../less/vars']
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../fixtures/less/vars')
      }
    }
  },
  fail: {
    replace: [
      [/~@/g, '../less/imgs']
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../fixtures/less/imgs')
      }
    }
  },
  extend: {
    replace: [
      [/~@/g, '../less/vars']
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../fixtures/less/vars')
      }
    }
  }
}


exports = module.exports = {
  getIds () {
    if (tests) {
      return tests;
    }
    tests = fs.readdirSync(lessDir).filter(name => path.extname(name) === '.less' && name.indexOf('.tmp') === -1).map(name => path.basename(name, '.less'));
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
  getLesscOpt (id) {
    return (this.getId(id).string || []).join(' ');
  },
  getReplacements (id) {
    return (this.getId(id).replace || []);
  }
}
