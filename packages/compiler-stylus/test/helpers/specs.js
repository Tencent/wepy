const fs = require('fs');
const path = require('path');

const stylusDir = path.resolve(__dirname, '../fixtures/stylus/');

let tests = null;

const options = {
  basic: {
    json: {},
    string: [],
    resolve: {}
  },
  alias: {
    replace: [[/~@/g, '../stylus/vars']],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../fixtures/stylus/vars')
      }
    }
  },
  'fail-missing-file': {
    error: 'fail-missing-file' // Error message.
  },
  'fail-uri-alias': {
    then: true, // Consider as a success test case.
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../fixtures/stylus/imgs')
      }
    }
  },
  extend: {
    replace: [[/~@/g, '../stylus/vars']],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../fixtures/stylus/vars')
      }
    }
  }
};

exports = module.exports = {
  getIds() {
    if (tests) {
      return tests;
    }
    tests = fs
      .readdirSync(stylusDir)
      .filter(name => path.extname(name) === '.styl' && name.indexOf('.tmp') === -1)
      .map(name => path.basename(name, '.styl'));
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
  getStyluscOpt(id) {
    return (this.getId(id).string || []).join(' ');
  },
  getReplacements(id) {
    return this.getId(id).replace || [];
  }
};
