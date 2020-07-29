const expect = require('chai').expect;
import { handleError } from '../../../weapp/util/error';

describe('core weapp util error', () => {
    it('when undefined', () => {
        const app = {
            data: 24
        };
        const func = handleError('ReferenceError', app, 'render');
        expect(func).to.deep.equal(undefined)
    });
});