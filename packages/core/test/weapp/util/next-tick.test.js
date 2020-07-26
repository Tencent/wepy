import { withMacroTask, nextTick, renderFlushCallbacks, renderNextTick} from '../../../weapp/util/next-tick';
const expect = require('chai').expect;

describe('next-tick test', function () {
    it('warn test', function () {
        expect(withMacroTask(label)).to.deep.equal(undefined);
    });
    

});