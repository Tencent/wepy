const expect = require('chai').expect;
const Hook = require('../../core/hook');

describe('Hook', function() {
  it('should register a hook', function() {
    const hook = new Hook();
    const handler = function() {};
    hook.register('process-test', handler);

    expect(hook._hooks).to.have.a.property('process-test');
    expect(hook._hooks['process-test']).to.be.a('array');
    expect(hook._hooks['process-test']).to.includes(handler);
  });

  it('should unregister a hook', function() {
    const hook = new Hook();
    const handler1 = function() {};
    const handler2 = function() {};

    const unregisterHandler1 = hook.register('process-test', handler1);
    hook.register('process-test', handler2);
    expect(hook._hooks['process-test']).to.includes(handler1);
    expect(hook._hooks['process-test']).to.includes(handler2);

    unregisterHandler1();
    expect(hook._hooks['process-test']).to.not.includes(handler1);
    expect(hook._hooks['process-test']).to.includes(handler2);

    hook.unregisterAll('process-test');
    expect(hook._hooks['process-test']).to.be.an('undefined');
  });

  it('should judge whether have a hook', function() {
    const hook = new Hook();
    const handler = function() {};
    hook.register('process-test', handler);

    expect(hook.hasHook('process-test')).to.be.true;
    expect(hook.hasHook('process-another')).to.be.false;
  });

  it('should verify hook function is correct', function() {
    const hook = new Hook();
    hook.register('process-test', function() {
      return 1;
    });

    expect(hook.hook('process-test')).to.eql([1]);

    hook.register('process-test', function(a) {
      return a;
    });
    expect(hook.hook('process-test', 6)).to.eql([1, 6]);

    hook.register('process-test', function(a, b) {
      return a + b;
    });
    expect(hook.hook('process-test', 6, 66)).to.eql([1, 6, 72]);
  });

  it('should verify hookSeq function is correct', function() {
    const hook = new Hook();

    expect(hook.hookSeq('unknown')).to.be.undefined;
    expect(hook.hookSeq('unknown', 1)).to.equal(1);
    expect(hook.hookSeq('unknown', 1, 2)).to.eql([1, 2]);

    hook.register('process-test', function(a) {
      return a + 1;
    });
    expect(hook.hookSeq('process-test', 6)).to.equal(7);

    hook.register('process-test', function(b) {
      return b * 2;
    });
    expect(hook.hookSeq('process-test', 6)).to.equal(14);
  });

  it('should verify hookUnique function is correct ', function() {
    const hook = new Hook();

    expect(hook.hookUnique('unknown')).to.be.undefined;

    hook.register('process-test', function(a) {
      return a + 1;
    });
    expect(hook.hookUnique('process-test', 6)).to.equal(7);

    hook.register('process-test', function(a) {
      return a * 2;
    });
    expect(hook.hookUnique('process-test', 6)).to.equal(12);
  });

  it('should verify hookUniqueReturnArg function is correct ', function() {
    const hook = new Hook();

    expect(hook.hookUniqueReturnArg('unknown')).to.be.undefined;
    expect(hook.hookUniqueReturnArg('unknown', 666)).to.equal(666);

    hook.register('process-test', function(a) {
      return a + 1;
    });
    expect(hook.hookUniqueReturnArg('process-test', 6)).to.equal(7);

    hook.register('process-test', function(a) {
      return a * 2;
    });
    expect(hook.hookUniqueReturnArg('process-test', 6)).to.equal(12);
  });

  it('should verify hookReturnOrigin function is correct ', function() {
    const hook = new Hook();
    let oneFnCalled = false;
    let twoFnCalled = false;

    expect(hook.hookReturnOrigin('unknown', 6)).to.equal(6);
    expect(hook.hookReturnOrigin('unknown', 6, 66)).to.eql([6, 66]);

    hook.register('process-test', function() {
      oneFnCalled = true;
    });

    expect(hook.hookReturnOrigin('process-test', 66)).to.equal(66);
    expect(oneFnCalled).to.be.true;

    hook.register('process-test', function() {
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

  it('hookAsyncSeq should call then correctly', function() {
    const hook = new Hook();

    return hook
      .hookAsyncSeq('unknown', 6)
      .then(rst => {
        // should return args[0]
        expect(rst).to.equal(6);

        return hook.hookAsyncSeq('unknown', 6, 66);
      })
      .then(rst => {
        // should return args
        expect(rst).to.eql([6, 66]);

        hook.register('process-test', function(obj) {
          return { count: obj.count + 1 };
        });
        return hook.hookAsyncSeq('process-test', { count: 6 });
      })
      .then(rst => {
        // should return lastRst for one hook fn
        expect(rst).to.eql({ count: 7 });

        hook.register('process-test', function(obj) {
          return new Promise(function(resolve) {
            resolve({ count: obj.count + 1 });
          });
        });
        return hook.hookAsyncSeq('process-test', { count: 6 });
      })
      .then(rst => {
        // should return lastRst for multiple hook fns
        expect(rst).to.eql({ count: 8 });

        hook.register('process-test', function(obj) {
          return new Promise(function(resolve) {
            resolve({ ...obj, text: 'hello, world!' });
          });
        });
        return hook.hookAsyncSeq('process-test', { count: 66 });
      })
      .then(rst => {
        // should return lastRst
        expect(rst).to.eql({ count: 68, text: 'hello, world!' });

        hook.register('process-test', function(obj) {
          return new Promise(function(resolve) {
            resolve([obj, { more: true }]);
          });
        });
        hook.register('process-test', function(obj, extra) {
          return new Promise(function(resolve) {
            expect(extra).to.eql({ more: true });
            resolve([obj, extra]);
          });
        });
        return hook.hookAsyncSeq('process-test', { count: 666 });
      })
      .then(rst => {
        // should return lastRst[0] if args.length === 1
        expect(rst).to.eql({ count: 668, text: 'hello, world!' });

        return hook.hookAsyncSeq('process-test', { count: 6666 }, { more: false });
      })
      .then(rst => {
        // should return lastRst if args.length > 1
        expect(rst).to.eql([{ count: 6668, text: 'hello, world!' }, { more: true }]);
      });
  });

  it('hookAsyncSeq should call catch correctly', function(done) {
    const hook = new Hook();

    hook.register('process-test', function() {
      return new Promise(function(resolve, reject) {
        reject({ text: 'hi, rejected!' });
      });
    });
    hook.hookAsyncSeq('process-test', { n: 6 }).catch(err => {
      expect(err).to.eql({ text: 'hi, rejected!' });
      done();
    });
  });

  it('hookAsyncSeq should not call then but catch', function(done) {
    const hook = new Hook();

    hook.register('process-test', function(obj) {
      return { n: obj.n + 1 };
    });
    hook.register('process-test', function() {
      return new Promise(function(resolve, reject) {
        reject({ text: 'hi, rejected!' });
      });
    });
    hook.register('process-test', function(obj) {
      return { n: obj.n + 2 };
    });
    hook
      .hookAsyncSeq('process-test', { n: 66 })
      .then(() => {
        throw new Error('it will not happen!');
      })
      .catch(err => {
        expect(err).to.eql({ text: 'hi, rejected!' });
        done();
      });
  });
});
