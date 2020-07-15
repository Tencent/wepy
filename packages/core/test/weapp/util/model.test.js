
const expect = require('chai').expect;
import { parseModel } from '../../../weapp/util/model';

describe('parseModel test', () => {
    it('没有方括号和点时', () => {
        var str = '  test  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test',
            key: null
        })
    });


    it('只有点时', () => {
        var str = ' test.key ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test',
            key: 'key'
        })
    });

    it('只有方括号时', () => {
        var str = '  test[key]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test',
            key: 'key'
        })
    });

    it('多个方括号嵌套时', () => {
        var str = ' test[test1[key]]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test',
            key: 'test1[key]'
        })
    });

    it('有双引号时', () => {
        var str = ' test["a"][key]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test[\"a\"]',
            key: 'key'
        })
    });

    it('点和方括号嵌套使用时', () => {
        var str = ' xxx.test[a[a].test1[key]]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'xxx.test',
            key: 'a[a].test1[key]'
        })
    });

    it('有多个点和方括号时', () => {
        var str = ' test.xxx.a["asa"][test1[key]]  ';
        expect(parseModel(str)).to.deep.equal({
            expr: 'test.xxx.a[\"asa\"]',
            key: 'test1[key]'
        })
    });


});

