const expect = require('chai').expect;
const pt = require('../../core/parseTemplate');

describe('parseTemplate', function() {

  it('parseFunction', function() {
    expect(pt.parseFunction('do(a,b,c)')).to.deep.equal({name: 'do', params: ['a', 'b', 'c']});
    expect(pt.parseFunction('do("a",b,c)')).to.deep.equal({name: 'do', params: ['"a"', 'b', 'c']});
  });


  it('parseHandler', function() {
    expect(pt.parseHandler('sth', 'do')).to.deep.equal({ type: 'bind:sth', handler: 'do', params: []});
    expect(pt.parseHandler('sth', 'do(a,b,c)')).to.deep.equal({ type: 'bind:sth', handler: 'do', params: ['a', 'b', 'c']});
    expect(pt.parseHandler('tap', 'do(a,b,c)')).to.deep.equal({ type: 'bind:tap', handler: 'do', params: ['a', 'b', 'c']});
    expect(pt.parseHandler('tap', 'do(a,b,c)', { stop: true })).to.deep.equal({ type: 'catch:tap', handler: 'do', params: ['a', 'b', 'c']});
    expect(pt.parseHandler('click', 'do(a,b,c)', { capture: true })).to.deep.equal({ type: 'capture-bind:tap', handler: 'do', params: ['a', 'b', 'c']});
    expect(pt.parseHandler('tap', 'do(a,b,c)', { capture: true, stop: true })).to.deep.equal({ type: 'capture-catch:tap', handler: 'do', params: ['a', 'b', 'c']});
  });

});