import { bar } from '../src/bar';

import { expect } from 'chai';

describe('core bar', function() {
  describe('core bar(bar())', function() {
    it('should return number minus one', function() {
      expect(bar(1)).to.equal(0);
    });
  });
});
