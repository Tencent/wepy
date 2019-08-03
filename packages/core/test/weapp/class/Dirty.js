import { patchData, initData } from '../../../weapp/init/data';
import Dirty from '../../../weapp/class/Dirty';

const expect = require('chai').expect;

describe('weapp class Dirty', function () {

  it('test dirty path', () => {

    const vm = {};
    vm.$dirty = new Dirty('path');

    initData(vm, { list: [], num: 1, arr: [1, 2], complex: { a: 1, arr: [100, { x: [ 0, 1, { b: 1 } ] }] } });

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

    vm.list.push({ a: 1 });
    dirty = vm.$dirty.pop();
    expect(JSON.stringify(dirty)).to.be.equal('{"list[0]":{"a":1}}');

    vm.list.push({ b: 1 });
    dirty = vm.$dirty.pop();
    expect(JSON.stringify(dirty)).to.be.equal('{"list[1]":{"b":1}}');

    vm.complex.arr.push(200);
    expect(vm.$dirty.length()).to.be.equal(1);
    dirty = vm.$dirty.pop();
    expect(vm.$dirty.length()).to.be.equal(0);
    expect(dirty).to.be.deep.equal({'complex.arr[2]': 200})

    vm.complex.arr.splice(1, 1, 233);
    expect(vm.$dirty.length()).to.be.equal(1);
    dirty = vm.$dirty.pop();
    expect(vm.$dirty.length()).to.be.equal(0);
    expect(dirty).to.be.deep.equal({'complex.arr': [100, 233, 200]})
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

