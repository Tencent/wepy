import { warn, tip } from '../../../weapp/util/debug';
const expect = require('chai').expect;

describe('Debug', function () {
    it('should display warning', function () {
        const app = {
            data: 24
        };
        expect(warn('SyntaxError', app)).to.deep.equal(undefined);
    });
    
    it('should display tipping', function () {
        const app = {
            data: 24
        };
        expect(tip('ReferenceError', app)).to.deep.equal(undefined);
    })
});
/*
*原文件中应该在 Found in component 之前加一个空格效果比较好？
*/