
const expect = require('chai').expect;
//var remove = require('../../../weapp/util/index').remove;
import { remove, isReserved, def, parsePath } from '../../../weapp/util/index';
import { obj } from 'through2';

describe('core weapp util index(removearr)', () => {
    it('should be removed [2]', () => {
        const arr1 = [2, 3, 7, 5, 6, 7, 8, 1];
        const removearr = remove(arr1, 2);
        expect(removearr).to.deep.equal([2]);
    });

    it('should be undefined(remove element does not exist)', () => {
        const arr2 = [2, 3, 7, 5, 6, 7, 8, 1];
        expect(remove(arr2, 4)).to.deep.equal(undefined);
    });

    it('should be undefined(array is null)', () => {
        const arr3 = [];
        expect(remove(arr3, 2)).to.deep.equal(undefined);
    })
});

describe('core weapp util index(isReserved)', () => {
    it('when a string starts with _', () => {
        expect(isReserved('_static')).to.be.true;
    });
    it('when a string starts with $ ', () => {
        expect(isReserved('$key')).to.be.true;
    });
    it('when a string starts without $ or _ ', () => {
        expect(isReserved('dhdff')).to.be.false;
    })
});

describe('core weapp util index(def)', () => {
    it('should add property', () => {
        const obj = {};
        def(obj, 'color', 'white', true);
        expect(obj).to.deep.equal({ color: 'white' });
    });

    it('should modify property', () => {
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


describe('core weapp util index(parsePath)', () => {
    it('should return an property value', () => {
        const path = 'wepy.test';
        let a = parsePath(path);
        const b = a({ wepy: { test: 1 } });
        expect(b).to.deep.equal(1);
    });

    it('should return an object', () => {
        const path = 'wepy.test';
        let a = parsePath(path);
        const b = a({ wepy: { test: { test2: 'test3' } } });
        expect(b).to.deep.equal({ test2: 'test3' });
    });

    it('when don\'t satisfy regular expression', () => {
        const path = 'wepy.test';
        let a = parsePath(path);
        const b = a({ wepy1: { test1: { test2: 'test3' } } });
        expect(b).to.deep.equal(undefined);
    });

    it('when satisfy regular expression', () => {
        const path = 'wepy\n';
        let a = parsePath(path);
        expect(a).to.deep.equal(undefined);
    });
});
