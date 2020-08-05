const expect = require('chai').expect;
const FileDep = require('../../core/fileDep');

describe('FileDep', function() {
  it('should add dependencies, get dependencies and get sources', function() {
    const fileDep = new FileDep();

    fileDep.addDeps('a.wpy', ['b.js', 'c.js']);
    expect(fileDep.getDeps('a.wpy')).to.eql(['b.js', 'c.js']);
    expect(fileDep.getSources('b.js')).to.eql(['a.wpy']);
    expect(fileDep.getSources('c.js')).to.eql(['a.wpy']);

    fileDep.addDeps('b.wpy', ['c.js', 'd.js']);
    expect(fileDep.getDeps('b.wpy')).to.eql(['c.js', 'd.js']);
    expect(fileDep.getSources('c.js')).to.eql(['a.wpy', 'b.wpy']);
  });

  it('should clean dependencies', function() {
    const fileDep = new FileDep();

    fileDep.addDeps('a.wpy', ['b.js', 'c.js']);
    fileDep.cleanDeps('a.wpy');
    expect(fileDep.getDeps('a.wpy')).to.eql([]);
    expect(fileDep.getSources('b.js')).to.eql([]);
    expect(fileDep.getSources('c.js')).to.eql([]);

    fileDep.addDeps('a.wpy', ['b.js', 'c.js']);
    fileDep.addDeps('b.wpy', ['c.js', 'd.js']);
    fileDep.cleanDeps('a.wpy');
    expect(fileDep.getDeps('a.wpy')).to.eql([]);
    expect(fileDep.getDeps('b.wpy')).to.eql(['c.js', 'd.js']);
    expect(fileDep.getSources('b.js')).to.eql([]);
    expect(fileDep.getSources('c.js')).to.eql(['b.wpy']);
    expect(fileDep.getSources('d.js')).to.eql(['b.wpy']);
  });

  it('should not add duplicated dependencies', function() {
    const fileDep = new FileDep();

    fileDep.addDeps('a.wpy', ['a.js', 'b.js']);
    expect(fileDep.getDeps('a.wpy')).to.eql(['a.js', 'b.js']);
    expect(fileDep.getSources('a.js')).to.eql(['a.wpy']);
    expect(fileDep.getSources('b.js')).to.eql(['a.wpy']);

    fileDep.addDeps('a.wpy', ['b.js', 'c.js', 'd.js']);
    expect(fileDep.getDeps('a.wpy')).to.eql(['a.js', 'b.js', 'c.js', 'd.js']);
    expect(fileDep.getSources('a.js')).to.eql(['a.wpy']);
    expect(fileDep.getSources('b.js')).to.eql(['a.wpy']);
    expect(fileDep.getSources('c.js')).to.eql(['a.wpy']);
    expect(fileDep.getSources('d.js')).to.eql(['a.wpy']);
  });

  it('should judge whether involved', function() {
    const fileDep = new FileDep();

    fileDep.addDeps('a.wpy', ['b.js', 'c.js']);
    expect(fileDep.isInvolved('a.wpy')).to.be.true;
    expect(fileDep.isInvolved('b.js')).to.be.true;
    expect(fileDep.isInvolved('c.js')).to.be.true;
    expect(fileDep.isInvolved('d.js')).to.be.false;

    fileDep.cleanDeps('a.wpy');
    expect(fileDep.isInvolved('a.wpy')).to.be.false;
    expect(fileDep.isInvolved('b.js')).to.be.false;
    expect(fileDep.isInvolved('c.js')).to.be.false;
  });
});
