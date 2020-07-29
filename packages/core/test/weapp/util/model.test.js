
const expect = require('chai').expect;
import { parseModel } from '../../../weapp/util/model';

describe('core weapp util model', () => {
    it('when no square brackets and dots ', () => {
        var str = '  test  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test',
            key: null
        })
    });


    it('when only dots ', () => {
        var str = ' test.key ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test',
            key: 'key'
        })
    });

    it('when only brackets ', () => {
        var str = '  test[key]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test',
            key: 'key'
        })
    });

    it('when multiple square brackets nesting ', () => {
        var str = ' test[test1[key]]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test',
            key: 'test1[key]'
        })
    });

    it('when double quotation marks ', () => {
        var str = ' test["a"][key]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test[\"a\"]',
            key: 'key'
        })
    });

    it('when points and brackets nesting ', () => {
        var str = ' xxx.test[a[a].test1[key]]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'xxx.test',
            key: 'a[a].test1[key]'
        })
    });

    it('when multiple dots and brackets ', () => {
        var str = ' test.xxx.a["asa"][test1[key]]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test.xxx.a[\"asa\"]',
            key: 'test1[key]'
        })
    });

    it('when start with quote and contain a pair of quotation', () => {
        var str = ' \'test.xxx\'.[a]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: '',
            key: ''
        })
    });

    it('when start with quote and contain only a quotation', () => {
        var str = ' \'test.xxx[a]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: '\'test.xxx',
            key: 'a'
        })
    });
});

