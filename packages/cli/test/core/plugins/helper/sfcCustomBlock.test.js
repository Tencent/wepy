const { alias } = require('../../../config');
const sfcCompiler = require('vue-template-compiler');
const Hook = require(`${alias.core}/hook`);
const initPlugin = require(`${alias.core}/init/plugin`);

const expect = require('chai').expect;

function createCompile() {
  const hook = new Hook();
  hook.options = { plugins: [] };
  initPlugin(hook);

  return hook;
}

describe('core helper sfcCustomBlock', function() {
  const compiler = createCompile();

  it('default sfc block', function() {
    const sfc = sfcCompiler.parseComponent(
      `
      <config></config>
      <wxs></wxs>
    `,
      { pad: 'space' }
    );

    const parsedSfc = compiler.hookSeq('sfc-custom-block', sfc);

    expect(parsedSfc).to.have.a.property('config');
    expect(parsedSfc).to.have.a.property('wxs');
    expect(parsedSfc.config.lang).to.equal('json');
    expect(parsedSfc.wxs).to.be.an.instanceof(Array);
  });

  it('custom sfc block', function() {
    const sfc = sfcCompiler.parseComponent(
      `
      <config lang="customLang1"></config>
      <wxs lang="customLang2"></wxs>
      <wxs></wxs>
    `,
      { pad: 'space' }
    );

    const parsedSfc = compiler.hookSeq('sfc-custom-block', sfc);

    expect(parsedSfc).to.have.a.property('config');
    expect(parsedSfc).to.have.a.property('wxs');
    expect(parsedSfc.config.lang).to.equal('customLang1');
    expect(parsedSfc.wxs).to.have.lengthOf(2);
    expect(parsedSfc.wxs.some(_ => _.lang === 'customLang2')).to.be.true;
  });
});
