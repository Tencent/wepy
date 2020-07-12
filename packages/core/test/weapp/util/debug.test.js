var generateComponentTrace = require('../../../weapp/util/debug.js').generateComponentTrace;
var expect = require('chai').expect;

describe('debug test',function(){
  it('vm = unexpected token', function() {
   expect(generateComponentTrace(1)).toBe('unexpected token')         
  })    
});