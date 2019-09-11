const expect = require('chai').expect;
const po = require('../../core/parseOptions');

describe('parseOptions', function() {

  it('getValue', function() {
    expect(po.getValue({}, 'a.b.c')).to.equal(undefined);

    expect(po.getValue({a: 1}, 'a')).to.equal(1);

    expect(po.getValue({a: {b: {c: 2}}}, 'a.b')).to.deep.equal({c: 2});
  });


  it('setValue', function() {
    expect(po.setValue({}, 'a.b.c', 1)).to.deep.equal({a:{b:{c:1}}});

    expect(po.setValue({a:{},a2:2}, 'a.b.c', 1)).to.deep.equal({a:{b:{c:1}},a2:2});

    expect(po.setValue({a:{b:3},a2:2}, 'a.b.c', 1)).to.deep.equal({a:{b:{c:1}},a2:2});

    expect(po.setValue({a:{b:{c:2,d:3}},a2:2}, 'a.b.c', 1)).to.deep.equal({a:{b:{c:1,d:3}},a2:2});
  });

  it('parse', function() {
    expect(po.parse().wpyExt).to.equal('.wpy');

    expect(po.parse({wpyExt: '.vue'}).wpyExt).to.equal('.vue');

    expect(po.parse({build: {web: {resolve: {a: 1}}}}).build.web.resolve.a).to.equal(1);

    expect(po.parse({watchOption: { awaitWriteFinish: { stabilityThreshold: 1000} }}).watchOption.awaitWriteFinish.stabilityThreshold).to.equal(1000);
  });

});
