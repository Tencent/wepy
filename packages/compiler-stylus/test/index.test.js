const path = require('path');
const fs = require('fs-extra');
const expect = require('chai').expect;
const stylusPlugin = require('../index');
const specs = require('./helpers/specs');
const ResolverFactory = require('enhanced-resolve').ResolverFactory;
const NodeJsInputFileSystem = require("enhanced-resolve/lib/NodeJsInputFileSystem");
const CachedInputFileSystem = require("enhanced-resolve/lib/CachedInputFileSystem");

class Hook {

  constructor () {
  }

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

function createCompile(stylusOpt, resolveOpt) {
  let instance = new Hook();
  stylusPlugin(stylusOpt).call(instance);

  instance.resolvers = {
    normal: ResolverFactory.createResolver(Object.assign({
      fileSystem: new CachedInputFileSystem(new NodeJsInputFileSystem(), 60000)
    }, resolveOpt))
  };

  instance.logger = {
    error (e) {
      console.log('======= ERROR OUTPUT ======');
      console.log(e);
    }
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

function readSpec(id, isFailSpec) {
  let stylusfile = path.join(__dirname, 'fixtures', 'stylus', id + '.styl');
  let expectfile = isFailSpec ? '' : path.join(__dirname, 'fixtures', 'css', id + '.css');

  return {
    node: {
      content: fs.readFileSync(stylusfile, 'utf-8')
    },
    file: stylusfile,
    expect: isFailSpec ? '' : fs.readFileSync(expectfile, 'utf-8')
  };
}

function compare(id, done) {

  let compile = createCompile(specs.getOpt(id), specs.getResolveOpt(id));

  let spec = readSpec(id);
  return compile.hook('wepy-compiler-stylus', spec.node, spec.file).then(node => {
    let css = node.compiled.code;
    expect(css).to.equal(spec.expect);
    done();
  }).catch(e => {
    done(e);
  });
}

function compileFail(id, done) {
  let compile = createCompile(specs.getOpt(id), specs.getResolveOpt(id));

  let spec = readSpec(id, true);

  let setting = specs.getId(id);

  return compile.hook('wepy-compiler-stylus', spec.node, spec.file).then((res) => {
    // e.g. uri-alias, alias is not awared in uri, so treat as compile successfully.
    if (setting.then) {
      done();
    }
  }).catch(e => {
    if (setting.error) {
      expect(e.lineno).to.be.gt(0);
      expect(e.filename).to.have.string(setting.error);
    } else {
      expect(e).to.be.an('error');
    }
    done();
  });
}

describe('wepy-compiler-stylus', function() {

  let ids = specs.getIds();

  let shouldPassIds = ids.filter(id => !/^fail-/.test(id));

  let shouldFailIds = ids.filter(id => /^fail-/.test(id));

  shouldPassIds.forEach(id => {
    it('Pass test cases: ' + id, function (done) {
      compare(id, done);
    });
  });
  shouldFailIds.forEach(id => {
    it('Fail test cases: ' + id, function (done) {
      compileFail(id, done);
    });
  });

});
