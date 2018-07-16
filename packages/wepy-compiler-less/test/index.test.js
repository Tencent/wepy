const path = require('path');
const fs = require('fs-extra');
const expect = require('chai').expect;
const lessPlugin = require('../index');
const specs = require('./helpers/specs');
const ResolverFactory = require('enhanced-resolve').ResolverFactory;
const NodeJsInputFileSystem = require("enhanced-resolve/lib/NodeJsInputFileSystem");
const CachedInputFileSystem = require("enhanced-resolve/lib/CachedInputFileSystem");
const expectFailIds = [ 'fail' ];

class Hook {
  register (key, fn) {
    if (!this._fns)
      this._fns = {};
    this._fns[key] = fn;
  }
  hook (key, ...args) {
    return this._fns[key].apply(this, args);
  }
  clear () {
    this._fns = {};
  }
}

function createCompile(lessOpt, resolveOpt) {
  let instance = new Hook();
  lessPlugin(lessOpt).call(instance);

  instance.resolvers = {
    normal: ResolverFactory.createResolver(Object.assign({
      fileSystem: new CachedInputFileSystem(new NodeJsInputFileSystem(), 60000)
    }, resolveOpt))
  };

  let fnNormalBak = instance.resolvers.normal.resolve;
  instance.resolvers.normal.resolve = function (...args) {
    return new Promise((resolve, reject) => {
      args.push(function (err, filepath, meta) {
        if (err) {
          reject(err);
        } else {
          resolve({path: filepath, meta: meta});
        }
      });
      fnNormalBak.apply(instance.resolvers.normal, args);
    });
  };
  return instance;
}

function readSpec(id) {
  let lessfile = path.join(__dirname, 'fixtures', 'less', id + '.less');
  let expectfile = path.join(__dirname, 'fixtures', 'css', id + '.css');

  return {
    node: {
      content: fs.readFileSync(lessfile, 'utf-8')
    },
    file: lessfile,
    expect: fs.readFileSync(expectfile, 'utf-8')
  };
}

function compare(id, done) {

  let compile = createCompile(specs.getOpt(id), specs.getResolveOpt(id));

  let spec = readSpec(id);
  return compile.hook('wepy-compiler-less', spec.node, spec.file).then(node => {
    let css = node.compiled.code;
    if (expectFailIds.includes(id)) {
      expect.fail();
    } else {
      expect(css).to.equal(spec.expect);
    }
    done();
  }).catch(e => {
    done(e);
  });
}

describe('wepy-compiler-less', function() {

  let ids = specs.getIds();

  let shouldPassIds = ids.filter(id => !expectFailIds.includes(id));

  let shouldFailIds = ids.filter(id => expectFailIds.includes(id));

  shouldPassIds.forEach(id => {
    it('testing ' + id, function (done) {
      compare(id, done);
    });
  });
  shouldFailIds.forEach(id => {
    it('should fail ' + id, function (done) {
      done();
    });
  });

});
