// TODO
const expect = require('chai').expect;
const Hook = require('../../wepy/packages/cli/core');
console.log('Hook:', Hook)

describe('Hook', function () {
  it('should register build-components', function () {
    const hook = new Hook();
    const handler = function () {
    };
    hook.register('build-components', handler);

    expect(hook._hooks).to.have.a.property('build-components');
    expect(hook._hooks['build-components']).to.be.a('array');
    expect(hook._hooks['build-components']).to.includes(handler);
  })
})