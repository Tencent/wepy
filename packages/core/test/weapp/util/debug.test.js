import { warn, tip } from '../../../weapp/util/debug';
const expect = require('chai').expect;

describe('debug test', function () {
    it('warn test', function () {
        const app = {
            data: 24
        };
        expect(warn('SyntaxError', app)).to.deep.equal(undefined);
    });
    
    it('tip test', function () {
        const app = {
            data: 24
        };
        expect(tip('ReferenceError', app)).to.deep.equal(undefined);
    })
});
/*
*原文件中应该在 Found in component 之前加一个空格效果比较好？
*/