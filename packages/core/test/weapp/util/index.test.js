
const expect = require('chai').expect;
//var remove = require('../../../weapp/util/index').remove;
import { remove, isReserved, def, parsePath } from '../../../weapp/util/index';

describe('remove test', () => {
  it('arr remove 2', () => {
    var arr = new Array(2, 3, 7, 5, 6, 7, 8, 1);
    const removearr = remove(arr, 2);
    expect(removearr).to.deep.equal([2])
  });

  it('arr remove 4', () => {
    var arr = new Array(2, 3, 7, 5, 6, 7, 8, 1);
    const removearr = remove(arr, 4);
    expect(removearr).to.deep.equal(undefined)
  });

  it('arr is null', () => {
    var arr = new Array();
    const removearr = remove(arr, 2);
    expect(removearr).to.deep.equal(undefined)
  })
});

describe('isReserved test', () => {
  it('Check if a string starts with _', () => {
    expect(isReserved('_static')).to.be.true
  });
  it('Check if a string starts with $ ', () => {
    expect(isReserved('$key')).to.be.true
  });
  it('Check if a string starts without $ or _ ', () => {
    expect(isReserved('dhdff')).to.be.false
  })
});

describe('def test', () => {
  it('add property', () => {
    var obj = {};
    def(obj, 'color', 'white', true);
    expect(obj).to.deep.equal({ color: 'white' })
  });

  it('modified property', () => {
    var obj = {
      eat: 'fish',
      color: 'white'
    };
    def(obj, 'color', 'black', true);
    expect(obj).to.deep.equal({
      eat: 'fish',
      color: 'black'
    })
  });
});


describe('parsePath test', () => {
  it('path test', () => {
    var path1 = 'rtdfg';
    var obj = {
    };
    var a = parsePath(path1);
    expect(a).to.deep.equal(0)
  });
});
