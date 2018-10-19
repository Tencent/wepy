const { alias } = require('../../config');
const expect = require('chai').expect;
const initPlugin = require(`${alias.init}/plugin`);
const Hook = require(`${alias.core}/hook`)

const plg = function () {};
const invalidPlg = {};

const specs = {
  normal: {
    called: false,
    plugins: [() => { specs.normal.called = true }]
  },
  single: {
    called: false,
    plugins: () => { specs.single.called = true }
  },
  validArr: {
    type: 'error',
    plugins: {},
    error: 'EXIT'
  },
  validSingle: {
    type: 'error',
    plugins: {},
    error: 'EXIT'
  }
}

const createCompile= (plugins) => {
  const compile = new Hook();

  compile.options = { plugins };

  compile.logger = {
    error (...args) {
      console.log('======= ERROR OUTPUT ======');
      console.log(...args);
    }
  };

  initPlugin(compile);
}

const compare = (name, done) => {
  const spec = specs[name];

  if (spec.type === 'error') {
    expect(() => createCompile(spec.plugins)).to.throw(spec.error)
    done()
  } else {
    createCompile(spec.plugins)

    expect(spec.called).to.be.true
    done()
  }
}

describe('init plugin', function () {

  Object.keys(specs).forEach(key => {

    it(`test ${key} plugin`, (done) => {
      compare(key, done);
    });
  })
});