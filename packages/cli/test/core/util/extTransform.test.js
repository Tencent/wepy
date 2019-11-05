const expect = require('chai').expect;
const po = require('../../../core/parseOptions');
const extTransform = require('../../../core/util/extTransform');

let rule = null;
describe('extTransform', function() {
  it('transform', function() {
    rule = po.parse();
    expect(extTransform(rule.weappRule)).to.deep.equal({
      script: [{ lang: 'js', ext: '.wpy' }, { ext: '.js', lang: 'js' }],
      style: [{ lang: 'wxss', ext: '.wpy' }, { ext: '.wxss', lang: 'wxss' }],
      config: [{ lang: 'json', ext: '.wpy' }, { ext: '.json', lang: 'json' }],
      template: [{ lang: 'wxml', ext: '.wpy' }, { ext: '.wxml', lang: 'wxml' }]
    });

    rule = po.parse({ weappRule: '.wpy' });
    expect(extTransform(rule.weappRule)).to.deep.equal({
      script: [{ lang: 'js', ext: '.wpy' }, { ext: '.js', lang: 'js' }],
      style: [{ lang: 'wxss', ext: '.wpy' }, { ext: '.wxss', lang: 'wxss' }],
      config: [{ lang: 'json', ext: '.wpy' }, { ext: '.json', lang: 'json' }],
      template: [{ lang: 'wxml', ext: '.wpy' }, { ext: '.wxml', lang: 'wxml' }]
    });
  });
  it('transform script', function() {
    rule = po.parse({ weappRule: { script: { ext: '.ts', lang: 'babel' } } });
    expect(extTransform(rule.weappRule)).to.deep.equal({
      script: [{ lang: 'babel', ext: '.ts' }, { ext: '.js', lang: 'js' }],
      style: [{ lang: 'wxss', ext: '.wxss' }],
      config: [{ lang: 'json', ext: '.json' }],
      template: [{ lang: 'wxml', ext: '.wxml' }]
    });

    rule = po.parse({ weappRule: { script: '.ts' } });
    expect(extTransform(rule.weappRule)).to.deep.equal({
      script: [{ lang: 'js', ext: '.ts' }, { lang: 'js', ext: '.js' }],
      style: [{ lang: 'wxss', ext: '.wxss' }],
      config: [{ lang: 'json', ext: '.json' }],
      template: [{ lang: 'wxml', ext: '.wxml' }]
    });
  });

  it('transform script object', function() {
    rule = po.parse({ weappRule: { script: { lang: 'babel' } } });

    expect(extTransform(rule.weappRule)).to.deep.equal({
      script: [{ lang: 'babel', ext: '.js' }, { lang: 'js', ext: '.js' }],
      style: [{ lang: 'wxss', ext: '.wxss' }],
      config: [{ lang: 'json', ext: '.json' }],
      template: [{ lang: 'wxml', ext: '.wxml' }]
    });
  });
});
