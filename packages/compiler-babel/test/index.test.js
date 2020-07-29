const fs = require('fs');
const path = require('path');
const expect = require('chai').expect;
const compileBabel = require('../index');
const helper = require('./helper/index');
const ast = require('./helper/ast');
const walk = require('acorn-walk');

class Hook {
  constructor() {
    this._hooks = {};
  }

  register(key, fn) {
    if (!this._hooks[key]) {
      this._hooks[key] = [];
    }
    this._hooks[key].push(fn);
  }
  hook(key, ...args) {
    return this._hooks[key].apply(this, args);
  }
  hookUnique(key, ...args) {
    let fns = this._hooks[key] || [];
    let lastFn = fns[fns.length - 1];

    if (typeof lastFn === 'function') {
      return lastFn.apply(this, args);
    }
  }
  clear() {
    this._hooks = {};
  }
}

function createWalker() {
  return {
    lang: 'babel',
    scope: {
      instances: [],
      definitions: [],
      renames: {}
    }
  };
}

function createCompile(opt) {
  let instance = new Hook();
  compileBabel(opt || {}).call(instance);

  instance.logger = {
    error(e) {
      /* eslint-disable no-console */
      console.log('======= ERROR OUTPUT ======');
      console.log(e);
      /* eslint-enable no-console */
    }
  };
  instance.register('error-handler', function(err) {
    /* eslint-disable no-console */
    console.error(err);
    /* eslint-enable no-console */
  });
  return instance;
}

function testFixture(file) {
  const compiler = createCompile({
    presets: ['env']
  });

  const walker = createWalker();

  const code = fs.readFileSync(path.join(__dirname, './fixtures/', file));

  return compiler
    .hookUnique(
      'wepy-compiler-babel',
      {
        src: './src',
        content: code
      },
      { file: file }
    )
    .then(rst => {
      const data = ast(rst.compiled.code);

      walk.simple(data, {
        VariableDeclarator(node) {
          compiler.hookUnique('prewalk-' + node.type, walker, node, node.id.name, node.id);
        },
        ExpressionStatement(node) {
          const expression = node.expression;
          if (expression.callee && expression.callee.type === 'MemberExpression') {
            const exprName = helper.getNameForExpression.call(walker, expression.callee);
            compiler.hookUnique('walker-detect-entry', walker, expression, exprName);
          }
        }
      });
      return walker;
    });
}

describe('compiler-babel', function() {
  it('should find entry', function() {
    return testFixture('app.js')
      .then(walker => {
        return !!walker.entry;
      })
      .then(res => {
        expect(res).to.equal(true);
      });
  });
});
