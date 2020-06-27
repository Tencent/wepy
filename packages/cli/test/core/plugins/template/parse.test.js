const { alias } = require('../../../config');
const expect = require('chai').expect;
const path = require('path');
const fs = require('fs-extra');
const Hook = require(`${alias.core}/hook`);
const tag = require(`${alias.core}/tag`);
const initPlugin = require(`${alias.core}/init/plugin`);
const moduleSet = require(`${alias.core}/moduleSet`);

function cached(fn) {
  var _cache = {};
  return function(key) {
    if (!_cache[key]) {
      _cache[key] = fn(key);
    }
    return _cache[key];
  };
}

const getRaw = cached(function(file) {
  const original = path.join(__dirname, '..', '..', 'fixtures/template/original', file + '.html');
  const assert = path.join(__dirname, '..', '..', 'fixtures/template/assert', file + '.wxml');

  return {
    originalRaw: fs.readFileSync(original, 'utf-8'),
    assertRaw: fs.readFileSync(assert, 'utf-8')
  };
});

const spec = {
  attr: [
    { file: 'v-if' },
    { file: 'v-for' },
    { file: 'v-show' },
    { file: 'bindClass' },
    { file: 'joinStyle' },
    { file: 'attrWithoutValue' },
    { file: 'reference' },
    {
      file: 'ref',
      component: {
        'custom-component-01': '~@/component/custom-component-01',
        'custom-component-02': '~@/component/custom-component-02'
      }
    }
  ],
  event: [
    {
      file: 'v-on',
      sfc: {
        wxs: [],
        template: { content: getRaw('v-on').originalRaw, code: getRaw('v-on').assertRaw }
      }
    },
    {
      file: 'v-on.wxs',
      sfc: {
        wxs: [{ attrs: { module: 'm' } }],
        template: { content: getRaw('v-on.wxs').originalRaw, code: getRaw('v-on.wxs').assertRaw }
      }
    }
  ],
  directives: ['v-model']
};

function createLogger(type) {
  return function(...args) {
    // mute silly and info
    if (type === 'silly' || type === 'info') {
      return;
    }
    /* eslint-disable no-console */
    console.log('==== This is ' + type + ' log===');
    console.log(...args);
    /* eslint-enable no-console */
  };
}

function createCompiler(options = {}) {
  const instance = new Hook();
  const appConfig = options.appConfig || {};
  const userDefinedTags = appConfig.tags || {};
  instance.options = { plugins: [] };

  instance.logger = {
    info: createLogger('info'),
    warn: createLogger('warn'),
    error: createLogger('error'),
    silly: createLogger('silly')
  };
  instance.tags = {
    htmlTags: tag.combineTag(tag.HTML_TAGS, userDefinedTags.htmlTags),
    wxmlTags: tag.combineTag(tag.WXML_TAGS, userDefinedTags.wxmlTags),
    html2wxmlMap: tag.combineTagMap(tag.HTML2WXML_MAP, userDefinedTags.html2wxmlMap),
    selfCloseTags: tag.SELF_CLOSE_TAGS
  };
  initPlugin(instance);

  instance.assets = new moduleSet();
  return instance;
}

function assetHanlder(handlers) {
  for (let id in handlers) {
    for (let type in handlers[id]) {
      const func = handlers[id][type];
      const funcfile = path.join(__dirname, '..', '..', 'fixtures/template/assert/v-on/', id + '.' + type + '.js');
      const fixture = fs.readFileSync(funcfile, 'utf-8');

      try {
        expect(func.replace(/\s*/gi, '').replace(/\n*/gi, '')).to.equal(
          fixture.replace(/\s*/gi, '').replace(/\n*/gi, '')
        );
      } catch (e) {
        /* eslint-disable no-console */
        console.log('Compiled Handler: ' + id + '.' + type + '.js');
        console.log(func);
        /* eslint-enable no-console */
        throw e;
      }
    }
  }
}

function assertCodegen(originalRaw, assertRaw, options = {}, ctx, done) {
  const compiler = createCompiler(options);
  compiler.assets.add(ctx.file);
  compiler
    .hookUnique('template-parse', originalRaw, options.component || {}, ctx)
    .then(rst => {
      expect(rst.code).to.equal(assertRaw);
      if (ctx.file === 'v-on') {
        assetHanlder(rst.rel.handlers);
      }
      done();
    })
    .catch(err => {
      done(err);
      // throw err;
    });
}

describe('template-parse', function() {
  spec.attr.forEach(ctx => {
    it('test attr: ' + ctx.file, function(done) {
      const { originalRaw, assertRaw } = getRaw(ctx.file);
      assertCodegen(originalRaw, assertRaw, ctx, ctx, done);
    });
  });

  spec.event.forEach(ctx => {
    it('test attr: ' + ctx.file, function(done) {
      const { originalRaw, assertRaw } = getRaw(ctx.file);
      assertCodegen(originalRaw, assertRaw, ctx, ctx, done);
    });
  });
});
