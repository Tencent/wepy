const expect = require('chai').expect;
const Hook = require('@wepy/cli/core/hook');
const PluginDefine = require('../index');

function createCompile(pluginOpt) {
  let instance = new Hook();
  PluginDefine(pluginOpt).call(instance);
  instance.parser = {
    replacements: []
  };
  return instance;
}

describe('plugin-define', function() {
  it('walker-unary-expression-undefined', function() {
    const names = {
      name: 'window'
    };
    // typeof window generate the same ast with typeof(window)
    // let a = typeof window;
    const unaryExpr = {
      type: 'UnaryExpression',
      start: 8,
      end: 21,
      operator: 'typeof',
      prefix: true,
      argument: {
        type: 'Identifier',
        start: 15,
        end: 21,
        name: 'window'
      }
    };

    let compile = createCompile();

    let args = compile.hookSeq('walker-unary-expression-undefined', compile.parser, unaryExpr, names);
    expect(args[0].replacements.length).to.equal(0);

    compile = createCompile({
      'typeof window': JSON.stringify('xyz')
    });
    args = compile.hookSeq('walker-unary-expression-undefined', compile.parser, unaryExpr, names);
    expect(args[0].replacements[0].expr).to.equal(unaryExpr);
    expect(args[0].replacements[0].value).to.equal('"xyz"');

    // delete x.y
    const deleteUnaryExpr = {
      type: 'UnaryExpression',
      start: 0,
      end: 10,
      operator: 'delete',
      prefix: true,
      argument: {
        type: 'MemberExpression',
        start: 7,
        end: 10,
        object: {
          type: 'Identifier',
          start: 7,
          end: 8,
          name: 'x'
        },
        property: {
          type: 'Identifier',
          start: 9,
          end: 10,
          name: 'y'
        },
        computed: false
      }
    };

    compile = createCompile({
      'x.y': JSON.stringify('xyz')
    });
    args = compile.hookSeq('walker-unary-expression-undefined', compile.parser, deleteUnaryExpr, { name: 'x.y' });
    expect(args[0].replacements.length).to.equal(0);
  });

  it('walker-member-expression-undefined', function() {
    const memberExpr = {
      type: 'MemberExpression',
      start: 8,
      end: 28,
      object: {
        type: 'MemberExpression',
        start: 8,
        end: 19,
        object: {
          type: 'Identifier',
          start: 8,
          end: 15,
          name: 'process'
        },
        property: {
          type: 'Identifier',
          start: 16,
          end: 19,
          name: 'env'
        },
        computed: false
      },
      property: {
        type: 'Identifier',
        start: 20,
        end: 28,
        name: 'NODE_ENV'
      },
      computed: false
    };

    const names = {
      name: 'process.env.NODE_ENV'
    };

    let compile = createCompile();

    let args = compile.hookSeq('walker-member-expression-undefined', compile.parser, memberExpr, names);
    expect(args[0].replacements.length).to.equal(0);

    compile = createCompile({
      'process.env.NODE_ENV': JSON.stringify('dev')
    });
    args = compile.hookSeq('walker-member-expression-undefined', compile.parser, memberExpr, names);
    expect(args[0].replacements[0].expr).to.equal(memberExpr);
    expect(args[0].replacements[0].value).to.equal('"dev"');
  });

  it('walker-identifier-undefined', function() {
    const memberExpr = {
      type: 'Identifier',
      start: 8,
      end: 19,
      name: 'DEFINED_VAR'
    };

    const names = {
      name: 'DEFINED_VAR'
    };

    let compile = createCompile();

    let args = compile.hookSeq('walker-identifier-undefined', compile.parser, memberExpr, names);
    expect(args[0].replacements.length).to.equal(0);

    compile = createCompile({
      DEFINED_VAR: JSON.stringify('something')
    });
    args = compile.hookSeq('walker-identifier-undefined', compile.parser, memberExpr, names);
    expect(args[0].replacements[0].expr).to.equal(memberExpr);
    expect(args[0].replacements[0].value).to.equal('"something"');
  });

  it('test different values', function() {
    let compile, args;

    compile = createCompile({
      V_NULL: null
    });
    args = compile.hookSeq('walker-member-expression-undefined', compile.parser, null, { name: 'V_NULL' });
    expect(args[0].replacements[0].value).to.equal('null');

    compile = createCompile({
      V_UNDEFINED: undefined
    });
    args = compile.hookSeq('walker-member-expression-undefined', compile.parser, null, { name: 'V_UNDEFINED' });
    expect(args[0].replacements[0].value).to.equal('undefined');

    const reg = new RegExp('[0-9a-z]', 'ig');
    compile = createCompile({
      V_REGEXP: reg
    });
    args = compile.hookSeq('walker-member-expression-undefined', compile.parser, null, { name: 'V_REGEXP' });
    expect(args[0].replacements[0].value).to.equal(reg.toString());

    const func = () => func(1);
    compile = createCompile({
      V_FUNCTION: func
    });
    args = compile.hookSeq('walker-member-expression-undefined', compile.parser, null, { name: 'V_FUNCTION' });
    expect(args[0].replacements[0].value).to.equal('(' + func.toString() + ')');

    const obj = { a: 1, b: 4 };
    compile = createCompile({
      V_OBJECT: obj
    });
    args = compile.hookSeq('walker-member-expression-undefined', compile.parser, null, { name: 'V_OBJECT' });
    const stringObj = args[0].replacements[0].value;
    const toObj = new Function('return ' + stringObj)();
    expect(JSON.stringify(obj)).to.equal(JSON.stringify(toObj));
  });
});
