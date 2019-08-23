const parseHandler = require('../../../core/ast/parseHandlerExpression.js/index.js')
const expect = require('chai').expect;

const specs = {
  MemberExpression: {
    name: 'a.b',
    wanted: 'a'
  },
  CallExpression: {
    name: 'a.b()',
    wanted: 'a'
  }
}

describe('ast test', function () {
  Object.keys(specs).forEach(key => {
    it(`test ${key} parseHandler`, (done) => {
      const handlerIdentifier = parseHandler(key.name);
      expect(handlerIdentifier).to.eql(key.wanted)
      done()
    });
  });
});