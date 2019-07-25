import { patchData, initData } from '../../../weapp/init/data';
import Dirty from '../../../weapp/class/Dirty';

const expect = require('chai').expect;

describe('weapp class Dirty', function () {

  it('test dirty path', () => {

    const vm = {};
    vm.$dirty = new Dirty('path');

    initData(vm, { num: 1, arr: [1, 2], complex: { a: 1, arr: [100, { x: [ 0, 1, { b: 1 } ] }] } });

    vm.num = 2;
    expect(vm.$dirty.length()).to.be.equal(1);

    let dirty;

    dirty = vm.$dirty.pop();
    expect(vm.$dirty.length()).to.be.equal(0);
    expect(dirty).to.deep.equal({ num: 2 });

    vm.num = 100;
    vm.complex.arr[1].x[2].b = 2;

    expect(vm.$dirty.length()).to.be.equal(2);
    dirty = vm.$dirty.pop();
    expect(vm.$dirty.length()).to.be.equal(0);
    expect(dirty).to.be.deep.equal({'num': 100, 'complex.arr[1].x[2].b': 2})
  });


  it('test dirty key', () => {
    const vm = {};
    vm.$dirty = new Dirty('key');

    initData(vm, { num: 1, arr: [1, 2], complex: { a: 1, arr: [100, { x: [ 0, 1, { b: 1 } ] }] } });

    vm.num = 2;
    expect(vm.$dirty.length()).to.be.equal(1);

    let dirty;

    dirty = vm.$dirty.pop();
    expect(vm.$dirty.length()).to.be.equal(0);
    expect(dirty).to.deep.equal({ num: 2 });

    vm.num = 100;
    vm.complex.arr[1].x[2].b = 2;

    expect(vm.$dirty.length()).to.be.equal(2);
    dirty = vm.$dirty.pop();
    expect(vm.$dirty.length()).to.be.equal(0);
    expect(dirty).to.be.deep.equal({'num': 100, 'complex': vm.complex})

  });

});

