const fs = require('fs');
const path = require('path');
const less = require('less');

const lessDir = path.resolve(__dirname, '../fixtures/less/');

let tests = null;

const options = {
  basic: {
    json: {},
    string: [],
    resolve: {}
  },
  alias: {
    replace: [[/~@/g, '../less/vars']],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../fixtures/less/vars')
      }
    }
  },
  'fail-missing-file': {
    error: `Can't resolve` // Error message.
  },
  'fail-uri-alias': {
    then: true, // Consider as a success test case.
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../fixtures/less/imgs')
      }
    }
  },
  extend: {
    replace: [[/~@/g, '../less/vars']],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../fixtures/less/vars')
      }
    }
  }
};

function compareArrayGe(arr1, arr2) {
  return arr1.every((currentValue, index) => {
    return currentValue >= arr2[index];
  });
}

function versionFilter(name) {
  const list = [
    {
      ge: [3, 7, 0],
      whiteList: ['list-each.less']
    }
  ];
  const lessVersion = less.version;

  const allWhiteList = list.reduce((accumulator, currentValue) => {
    return accumulator.concat(currentValue.whiteList);
  }, []);
  if (allWhiteList.indexOf(name) < 0) {
    return true;
  }

  return list.some(element => {
    if (compareArrayGe(lessVersion, element.ge) && element.whiteList.indexOf(name) >= 0) {
      return true;
    }
  });
}

exports = module.exports = {
  getIds() {
    if (tests) {
      return tests;
    }
    tests = fs
      .readdirSync(lessDir)
      .filter(name => path.extname(name) === '.less' && name.indexOf('.tmp') === -1 && versionFilter(name))
      .map(name => path.basename(name, '.less'));
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
  getLesscOpt(id) {
    return (this.getId(id).string || []).join(' ');
  },
  getReplacements(id) {
    return this.getId(id).replace || [];
  }
};
