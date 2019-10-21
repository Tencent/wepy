import { initData } from '../../../weapp/init/data';
import { set } from '../../../weapp/observer';
import { getPathMap } from '../../../weapp/observer/observerPath';

const expect = require('chai').expect;
const _getPathMap = (obj, key) =>
  key !== undefined
    ? getPathMap(key, obj.__ob__.op.pathKeys, obj.__ob__.op.pathMap).combinePathMap
    : obj.__ob__.op.pathMap;

describe('weapp observer observerPath', function() {
  it('only path', function() {
    const vm = {};

    initData(vm, { num: 1, str: 'string', arr: [1, 2], obj: { a: 1 }, deepObj: { node: { a: 1 } } });

    const data = vm._data;
    expect(_getPathMap(data, 'num')).to.be.deep.equal({ num: { key: 'num', root: 'num', path: 'num' } });
    expect(_getPathMap(data, 'str')).to.be.deep.equal({ str: { key: 'str', root: 'str', path: 'str' } });
    expect(_getPathMap(data, 'arr')).to.be.deep.equal({ arr: { key: 'arr', root: 'arr', path: 'arr' } });
    expect(_getPathMap(data, 'obj')).to.be.deep.equal({ obj: { key: 'obj', root: 'obj', path: 'obj' } });
    expect(_getPathMap(data, 'deepObj')).to.be.deep.equal({
      deepObj: {
        key: 'deepObj',
        root: 'deepObj',
        path: 'deepObj'
      }
    });
  });

  it('only deep path', function() {
    const vm = {};

    initData(vm, { arr: [1, 2], obj: { a: 1 }, deepObj: { node: { a: 1 } } });

    const data = vm._data;
    expect(_getPathMap(data.arr, 0)).to.be.deep.equal({ 'arr[0]': { key: 0, root: 'arr', path: 'arr[0]' } });
    expect(_getPathMap(data.obj, 'a')).to.be.deep.equal({ 'obj.a': { key: 'a', root: 'obj', path: 'obj.a' } });
    expect(_getPathMap(data.deepObj.node, 'a')).to.be.deep.equal({
      'deepObj.node.a': { key: 'a', root: 'deepObj', path: 'deepObj.node.a' }
    });

    set(vm, vm.deepObj, 'parent', { child: 233 });
    expect(_getPathMap(data.deepObj, 'parent')).to.be.deep.equal({
      'deepObj.parent': { key: 'parent', root: 'deepObj', path: 'deepObj.parent' }
    });
    expect(_getPathMap(data.deepObj.parent, 'child')).to.be.deep.equal({
      'deepObj.parent.child': { key: 'child', root: 'deepObj', path: 'deepObj.parent.child' }
    });
  });

  it('complex path: Object', function() {
    const vm = {};

    initData(vm, { a: { b: { c: { d: 123 } } }, x: {}, y: {} });

    // eslint-disable-next-line
    console.log('complex path: Object');
    const data = vm._data;
    data.x = data.a.b.c;
    data.y = data.x;

    expect(_getPathMap(data.a.b.c, 'd')).to.be.deep.equal({
      'x.d': { key: 'd', root: 'x', path: 'x.d' },
      'y.d': { key: 'd', root: 'y', path: 'y.d' },
      'a.b.c.d': { key: 'd', root: 'a', path: 'a.b.c.d' }
    });
    expect(_getPathMap(data.x, 'd')).to.be.deep.equal({
      'x.d': { key: 'd', root: 'x', path: 'x.d' },
      'y.d': { key: 'd', root: 'y', path: 'y.d' },
      'a.b.c.d': { key: 'd', root: 'a', path: 'a.b.c.d' }
    });
    expect(_getPathMap(data.y, 'd')).to.be.deep.equal({
      'x.d': { key: 'd', root: 'x', path: 'x.d' },
      'y.d': { key: 'd', root: 'y', path: 'y.d' },
      'a.b.c.d': { key: 'd', root: 'a', path: 'a.b.c.d' }
    });

    data.x = { d: 123 };

    expect(_getPathMap(data.a.b.c, 'd')).to.be.deep.equal({
      'y.d': { key: 'd', root: 'y', path: 'y.d' },
      'a.b.c.d': { key: 'd', root: 'a', path: 'a.b.c.d' }
    });
    expect(_getPathMap(data.x, 'd')).to.be.deep.equal({
      'x.d': { key: 'd', root: 'x', path: 'x.d' }
    });
    expect(_getPathMap(data.y, 'd')).to.be.deep.equal({
      'y.d': { key: 'd', root: 'y', path: 'y.d' },
      'a.b.c.d': { key: 'd', root: 'a', path: 'a.b.c.d' }
    });
  });

  it('complex path: Array', function() {
    const vm = {};

    initData(vm, { arr1: [], arr2: [], arr3: [] });

    const data = vm._data;
    const obj = { a: 123 };
    data.arr1.push(obj);
    data.arr2.splice(0, 0, obj);
    data.arr3.unshift(obj);

    expect(_getPathMap(data.arr1[0], 'a')).to.be.deep.equal({
      'arr1[0].a': { key: 'a', root: 'arr1', path: 'arr1[0].a' },
      'arr2[0].a': { key: 'a', root: 'arr2', path: 'arr2[0].a' },
      'arr3[0].a': { key: 'a', root: 'arr3', path: 'arr3[0].a' }
    });
    expect(_getPathMap(data.arr2[0], 'a')).to.be.deep.equal({
      'arr1[0].a': { key: 'a', root: 'arr1', path: 'arr1[0].a' },
      'arr2[0].a': { key: 'a', root: 'arr2', path: 'arr2[0].a' },
      'arr3[0].a': { key: 'a', root: 'arr3', path: 'arr3[0].a' }
    });
    expect(_getPathMap(data.arr3[0], 'a')).to.be.deep.equal({
      'arr1[0].a': { key: 'a', root: 'arr1', path: 'arr1[0].a' },
      'arr2[0].a': { key: 'a', root: 'arr2', path: 'arr2[0].a' },
      'arr3[0].a': { key: 'a', root: 'arr3', path: 'arr3[0].a' }
    });

    data.arr2.splice(0, 1);

    expect(_getPathMap(data.arr1[0], 'a')).to.be.deep.equal({
      'arr1[0].a': { key: 'a', root: 'arr1', path: 'arr1[0].a' },
      'arr3[0].a': { key: 'a', root: 'arr3', path: 'arr3[0].a' }
    });
    expect(_getPathMap(data.arr3[0], 'a')).to.be.deep.equal({
      'arr1[0].a': { key: 'a', root: 'arr1', path: 'arr1[0].a' },
      'arr3[0].a': { key: 'a', root: 'arr3', path: 'arr3[0].a' }
    });
  });
});
