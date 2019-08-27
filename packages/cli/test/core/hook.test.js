const expect = require('chai').expect;
const Hook = require('../../core/hook');

describe('Hook', function () {
  it('should register', function () {
    const hook = new Hook();
    const handler = function () {
    };
    hook.register('process-test', handler);

    expect(hook._hooks).to.have.a.property('process-test');
    expect(hook._hooks['process-test']).to.be.a('array');
    expect(hook._hooks['process-test']).to.includes(handler);
  });

  it('should has hook', function () {
    const hook = new Hook();
    const handler = function () {
    };
    hook.register('process-test', handler);

    expect(hook.hasHook('process-test')).to.be.true;
    expect(hook.hasHook('process-another')).to.be.false;
  });

  it('should hook', function () {
    const hook = new Hook();
    hook.register('process-test', function () {
      return 1;
    });

    expect(hook.hook('process-test')).to.eql([1]);

    hook.register('process-test', function (a) {
      return a;
    });
    expect(hook.hook('process-test', 6)).to.eql([1, 6]);

    hook.register('process-test', function (a, b) {
      return a + b;
    });
    expect(hook.hook('process-test', 6, 66)).to.eql([1, 6, 72]);
  });

  it('should hookSeq', function () {
    const hook = new Hook();

    expect(hook.hookSeq('unknown')).to.be.undefined;
    expect(hook.hookSeq('unknown', 1)).to.equal(1);
    expect(hook.hookSeq('unknown', 1, 2)).to.eql([1, 2]);

    hook.register('process-test', function (a) {
      return a + 1;
    });
    expect(hook.hookSeq('process-test', 6)).to.equal(7);

    hook.register('process-test', function (b) {
      return b * 2;
    });
    expect(hook.hookSeq('process-test', 6)).to.equal(14);
  });

  it('should hookUnique', function () {
    const hook = new Hook();

    expect(hook.hookUnique('unknown')).to.be.undefined;

    hook.register('process-test', function (a) {
      return a + 1;
    });
    expect(hook.hookUnique('process-test', 6)).to.equal(7);

    hook.register('process-test', function (a) {
      return a * 2;
    });
    expect(hook.hookUnique('process-test', 6)).to.equal(12);
  });

  it('should hookUniqueReturnArg', function () {
    const hook = new Hook();

    expect(hook.hookUniqueReturnArg('unknown')).to.be.undefined;
    expect(hook.hookUniqueReturnArg('unknown', 666)).to.equal(666);

    hook.register('process-test', function (a) {
      return a + 1;
    });
    expect(hook.hookUniqueReturnArg('process-test', 6)).to.equal(7);

    hook.register('process-test', function (a) {
      return a * 2;
    });
    expect(hook.hookUniqueReturnArg('process-test', 6)).to.equal(12);
  });

  it('should hookReturnOrigin', function () {
    const hook = new Hook();
    let oneFnCalled = false;
    let twoFnCalled = false;

    expect(hook.hookReturnOrigin('unknown', 6)).to.equal(6);
    expect(hook.hookReturnOrigin('unknown', 6, 66)).to.eql([6, 66]);

    hook.register('process-test', function () {
      oneFnCalled = true;
    });

    expect(hook.hookReturnOrigin('process-test', 66)).to.equal(66);
    expect(oneFnCalled).to.be.true;

    hook.register('process-test', function () {
      twoFnCalled = true;
    });
    expect(hook.hookReturnOrigin('process-test', 666)).to.equal(666);
    expect(twoFnCalled).to.be.true;

    oneFnCalled = false;
    twoFnCalled = false;
    expect(hook.hookReturnOrigin('process-test', 66, 666)).to.eql([66, 666]);
    expect(oneFnCalled).to.be.true;
    expect(twoFnCalled).to.be.true;
  });

  it('should hookAsyncSeq', function () {
    const hook = new Hook();

    hook.hookAsyncSeq('unknown', 6).then(rst => {
      expect(rst).to.equal(6);
    });
    hook.hookAsyncSeq('unknown', 6, 66).then(rst => {
      expect(rst).to.eql([6, 66]);
    });

    hook.register('process-test', function (obj) {
      return new Promise(function (resolve) {
        resolve({ count: obj.count + 1 });
      });
    });
    hook.hookAsyncSeq('process-test', { count: 6 }).then(rst => {
      expect(rst).to.eql({ count: 7 });
    });

    hook.register('process-test', function (obj) {
      return new Promise(function (resolve) {
        resolve({ ...obj, text: 'hello, world!' });
      });
    });
    hook.hookAsyncSeq('process-test', { count: 66 }).then(rst => {
      expect(rst).to.eql({ count: 67, text: 'hello, world!' });
    });

    hook.register('process-test', function (obj) {
      return new Promise(function (resolve) {
        resolve([obj, { more: true }]);
      });
    });
    hook.register('process-test', function (obj, extra) {
      return new Promise(function (resolve) {
        expect(extra).to.eql({ more: true });
        resolve([obj, extra]);
      });
    });
    hook.hookAsyncSeq('process-test', { count: 666 }).then(rst => {
      expect(rst).to.eql({ count: 667, text: 'hello, world!' });
    });
    hook.hookAsyncSeq('process-test', { count: 6666 }, { more: false }).then(rst => {
      expect(rst).to.eql([{ count: 6667, text: 'hello, world!' }, { more: true }]);
    });

    hook.register('process-test', function (obj) {
      return new Promise(function (resolve, reject) {
        reject({ text: 'hi, rejected!' });
      });
    });
    hook.hookAsyncSeq('process-test', { count: 66 }).catch(err => {
      expect(err).to.eql({ text: 'hi, rejected!' });
    });

    hook.unregister('process-test');
    hook.register('process-test', function (obj) {
      return new Promise(function (resolve) {
        throw new Error('hi, this is an exception!');
      });
    });
    hook.hookAsyncSeq('process-test', { count: 66 }).catch(err => {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.equal('hi, this is an exception!');
    });
  });
});
