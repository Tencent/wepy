const { alias } = require('../../../config');
const expect = require('chai').expect;
const path = require('path');
const fs = require('fs-extra');
const Hook = require(`${alias.core}/hook`);
const tag = require(`${alias.core}/tag`);
const pt = require(`${alias.plugins}/template/parse`);

const spec = {
  attr: ['v-if', 'v-for', 'v-show'],
  event: ['v-on'],
  directives: ['v-model']
}

function createCompiler (options = {}) {
  const instance = new Hook();
  const appConfig = options.appConfig || {};
  const userDefinedTags = appConfig.tags || {};
  instance.tags = {
    htmlTags: tag.combineTag(tag.HTML_TAGS, userDefinedTags.htmlTags),
    wxmlTags: tag.combineTag(tag.WXML_TAGS, userDefinedTags.wxmlTags),
    html2wxmlMap: tag.combineTagMap(tag.HTML2WXML_MAP, userDefinedTags.html2wxmlMap)
  };
  pt.call(instance);
  return instance;
}

function getRaw (file, lang = 'wxml') {
  const original = path.join(__dirname, '..', '..', 'fixtures/template/original', file + '.wxml');
  const assert = path.join(__dirname, '..', '..', 'fixtures/template/assert', file + '.wxml');

  return {
    originalRaw: fs.readFileSync(original, 'utf-8'),
    assertRaw: fs.readFileSync(assert, 'utf-8')
  };
}

function assertCodegen (originalRaw, assertRaw, options = {}, done) {
  const compiler = createCompiler(options);

  compiler.hookUnique('template-parse', originalRaw).then((rst) => {
    expect(rst.code).to.equal(assertRaw);
    done();
  }).catch(err => {
    done(err);
    // throw err;
  });
}

describe('template-parse', function () {

  spec.attr.forEach(file => {

    it('test attr: ' + file, function (done) {
      const { originalRaw, assertRaw } = getRaw(file);
      assertCodegen(originalRaw, assertRaw, {}, done)
    })
  });
});