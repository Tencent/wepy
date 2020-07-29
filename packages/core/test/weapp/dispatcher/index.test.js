import { expect } from 'chai';
import { dispatcher } from '../../../weapp/dispatcher/index';
import { addEventListener, createOriginalPage, simulateOriginalWePYEvent } from '../helper/index';

describe('core weapp dispatcher', function() {
  it('should create page', done => {
    const page = createOriginalPage();

    const params = [1, 2];

    const evtid = addEventListener(page, 'tap', function(...args) {
      expect(args[0]).is.equal(params[0]);
      expect(args[1]).is.equal(params[1]);
      expect(args[2].type).is.equal('tap');
      done();
    });

    const e = simulateOriginalWePYEvent('tap', evtid, params);
    dispatcher.call(page, e);
  });
});
