
const expect = require('chai').expect;
import { parseModel } from '../../../weapp/util/model';

describe('parseModel test', () => {
    it('there are no square brackets and dots :', () => {
        var str = '  test  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test',
            key: null
        })
    });


    it('there are only dots :', () => {
        var str = ' test.key ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test',
            key: 'key'
        })
    });

    it(' there are only brackets :', () => {
        var str = '  test[key]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test',
            key: 'key'
        })
    });

    it('there are multiple square brackets nesting :', () => {
        var str = ' test[test1[key]]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test',
            key: 'test1[key]'
        })
    });

    it('there are double quotation marks ：', () => {
        var str = ' test["a"][key]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test[\"a\"]',
            key: 'key'
        })
    });

    it('there are points and brackets nesting :', () => {
        var str = ' xxx.test[a[a].test1[key]]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'xxx.test',
            key: 'a[a].test1[key]'
        })
    });

    it('there are multiple dots and brackets :', () => {
        var str = ' test.xxx.a["asa"][test1[key]]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test.xxx.a[\"asa\"]',
            key: 'test1[key]'
        })
    });


});

