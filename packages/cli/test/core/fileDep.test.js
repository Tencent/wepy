const expect = require('chai').expect;
const FileDep = require('../../core/fileDep');

describe('FileDep', function () {
  it('should addDeps, getDeps and getSources', function () {
    const fileDep = new FileDep();

    fileDep.addDeps('a.wpy', ['b.js', 'c.js']);
    expect(fileDep.getDeps('a.wpy')).to.eql(['b.js', 'c.js']);
    expect(fileDep.getSources('c.js')).to.eql(['a.wpy']);

    fileDep.addDeps('b.wpy', ['c.js', 'd.js']);
    expect(fileDep.getDeps('b.wpy')).to.eql(['c.js', 'd.js']);
    expect(fileDep.getSources('c.js')).to.eql(['a.wpy', 'b.wpy']);
  });

  it('should cleanDeps', function () {
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
});
