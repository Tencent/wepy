import { patchData, initData } from '../../../weapp/init/data';

const expect = require('chai').expect;

describe('weapp init data', function() {
  it('patch data', () => {
    const output = {};

    patchData(output, false);

    expect(output.data).to.be.an('object');

    patchData(output, { a: 1 });

    expect(output.data.a).to.equal(1);
  });

  it('init data', () => {
    const vm = {};

    initData(vm, { num: 1, str: 'string', arr: [1, 2], obj: { a: 1 }, deepobj: { node: { a: 1 } } });

    expect(vm.num).to.be.equal(vm._data.num);
    expect(vm.str).to.be.equal(vm._data.str);
    expect(vm.arr).to.be.equal(vm._data.arr);
    expect(vm.obj).to.be.equal(vm._data.obj);
    expect(vm.deepobj).to.be.equal(vm._data.deepobj);
    expect(vm.obj.__ob__).to.be.an('object');
    expect(vm.deepobj.node.__ob__).to.be.an('object');
  });

  it('init data from function', () => {
    const vm = {};

    initData(vm, function() {
      return {
        a: 1
      };
    });

    expect(vm.a).to.be.equal(1);
  });
});
