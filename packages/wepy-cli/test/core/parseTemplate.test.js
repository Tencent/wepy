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

  it('parseModifiers', function() {
    expect(pt.parseModifiers('')).to.deep.equal({})
    expect(pt.parseModifiers(undefined)).to.deep.equal({})
    expect(pt.parseModifiers('tap')).to.deep.equal({})
    expect(pt.parseModifiers('tap.a')).to.deep.equal({ a: true })
    expect(pt.parseModifiers('tap.a.b')).to.deep.equal({ a: true, b: true })
  })

  it('parseFor', function () {
    expect(pt.parseFor('')).to.deep.equal({})
    expect(pt.parseFor(undefined)).to.deep.equal({})
    // variableMatch
    expect(pt.parseFor('items')).to.deep.equal({ alias: 'item', for: 'items' })
    expect(pt.parseFor(' items ')).to.deep.equal({ alias: 'item', for: 'items' })
    // aliasMatch
    expect(pt.parseFor('i in items')).to.deep.equal({ alias: 'i', for: 'items' })
    expect(pt.parseFor(' i in items ')).to.deep.equal({ alias: 'i', for: 'items' })
    expect(pt.parseFor('(i) in items ')).to.deep.equal({ alias: 'i', for: 'items' })
    // iteratorMatch
    expect(pt.parseFor('(a, b) in items ')).to.deep.equal({ alias: 'a', for: 'items', iterator1: 'b' })
    expect(pt.parseFor('(a, b, c) in items ')).to.deep.equal({ alias: 'a', for: 'items', iterator1: 'b', iterator2: 'c' })
    expect(pt.parseFor(' ( a, b,c) in items ')).to.deep.equal({ alias: 'a', for: 'items', iterator1: 'b', iterator2: 'c' })    
    expect(pt.parseFor(' ( a, b,c  ) in items ')).to.deep.equal({ alias: 'a', for: 'items', iterator1: 'b', iterator2: 'c' })    
  })
});