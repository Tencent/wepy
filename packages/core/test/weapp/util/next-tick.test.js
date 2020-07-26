import { withMacroTask, nextTick, renderFlushCallbacks, renderNextTick} from '../../../weapp/util/next-tick';
const expect = require('chai').expect;

describe('next-tick test', function () {
  it('macro task with normal function', function () {
    const fn = () => 1;
    expect(withMacroTask(fn)).is.an('function');
  });
});
