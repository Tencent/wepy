
const expect = require('chai').expect;
//var remove = require('../../../weapp/util/index').remove;
import { remove, isReserved, def, parsePath } from '../../../weapp/util/index';
import { obj } from 'through2';

describe('remove test', () => {
    it('arr remove 2', () => {
        const arr1 = [2, 3, 7, 5, 6, 7, 8, 1];
        const removearr = remove(arr1, 2);
        expect(removearr).to.deep.equal([2]);
    });

    it('arr remove 4', () => {
        const arr2 = [2, 3, 7, 5, 6, 7, 8, 1];
        expect(remove(arr2, 4)).to.deep.equal(undefined);
    });

    it('arr is null', () => {
        const arr3 = [];
        expect(remove(arr3, 2)).to.deep.equal(undefined);
    })
});

describe('isReserved test', () => {
    it('Check if a string starts with _', () => {
        expect(isReserved('_static')).to.be.true;
    });
    it('Check if a string starts with $ ', () => {
        expect(isReserved('$key')).to.be.true;
    });
    it('Check if a string starts without $ or _ ', () => {
        expect(isReserved('dhdff')).to.be.false;
    })
});

describe('def test', () => {
    it('add property', () => {
        const obj = {};
        def(obj, 'color', 'white', true);
        expect(obj).to.deep.equal({ color: 'white' });
    });

    it('modified property', () => {
        const obj = {
            eat: 'fish',
            color: 'white'
        };
        def(obj, 'color', 'black', true);
        expect(obj).to.deep.equal({
            eat: 'fish',
            color: 'black'
        });
    });
});


describe('parsePath test', () => {
    it('parsePath test: return an property value', () => {
        const path = 'wepy.test';
        let a = parsePath(path);
        const b = a({ wepy: { test: 1 } });
        expect(b).to.deep.equal(1);
    });

    it('parsePath test: return an object', () => {
        const path = 'wepy.test';
        let a = parsePath(path);
        const b = a({ wepy: { test: { test2: 'test3' } } });
        expect(b).to.deep.equal({ test2: 'test3' });
    });

    it('parsePath test: Don\'t satisfy regular expression', () => {
        const path = 'wepy.';
        let a = parsePath(path);
        const b = a({ wepy: { test: { test2: 'test3' } } });
        expect(b).to.deep.equal(undefined);
    });

    it('parsePath test: Don\'t satisfy regular expression', () => {
        const path = 'wepy.test';
        let a = parsePath(path);
        const b = a({ wepy1: { test1: { test2: 'test3' } } });
        expect(b).to.deep.equal(undefined);
    });
});
