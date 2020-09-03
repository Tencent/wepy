const expect = require('chai').expect;
import { handleError } from '../../../weapp/util/error';

describe('handleError test', () => {
    it('error test', () => {
        const app = {
            data: 24
        };
        const func = handleError('ReferenceError', app, 'render');
        expect(func).to.deep.equal(undefined)
    });
});