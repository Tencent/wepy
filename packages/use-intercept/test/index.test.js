import useInterceptInstall from '../install';
const { expect } = require('chai');

function ensureAllTaskDone(taskList, done) {
  let tasks = {};
  taskList.forEach(v => (tasks[v] = false));

  let _interval = setInterval(function() {
    let alldone = true;
    for (let k in tasks) {
      alldone = alldone && tasks[k];
    }
    if (alldone) {
      clearInterval(_interval);
      done();
    }
  });
  return {
    done: function(key) {
      tasks[key] = true;
    }
  };
}

describe('use-intercept', function() {
  let __storage = {
    mydata: { a: 1 }
  };

  let wx = {
    request: function(option) {
      setTimeout(() => {
        option.fail && option.fail(new Error('wx.request error'));
        option.complete && option.complete({ a: 1 });
      }, 1000);
    },
    getStorage: function(option) {
      setTimeout(() => {
        let res = __storage[option.key];
        option.success && option.success(res);
        option.complete && option.complete(res);
      });
    },
    setStorage: function(option) {
      setTimeout(() => {
        __storage[option.key] = option.data;
      });
    },
    setStorageSync: function(option) {
      __storage[option.key] = option.data;
    },
    getStorageSync: function(key) {
      let res = __storage[key];
      return res;
    },
    someNewAPI: function(option) {
      setTimeout(() => {
        option.success(option.num);
      });
    },
    showActionSheet: function(option) {
      setTimeout(() => {
        option.success && option.success(option);
      });
    }
  };

  before(function() {
    global.wx = wx;
  });

  it('should callback success', function(done) {
    let task = ensureAllTaskDone(['test-getStorage-config', 'test-getStorage-success', 'test-request-complete'], done);

    let wepy = {};
    useInterceptInstall(wepy);

    const timeNow = +new Date();
    const getStorage = wepy.intercept(wepy.wx.getStorage, {
      config(p) {
        p.t = timeNow;
        expect(p.key).to.equal('sid');
        task.done('test-getStorage-config');
        return p;
      },
      success(res) {
        res += ' world';
        return res;
      },
      complete(res) {
        res += ' complete';
        return res;
      }
    });

    expect(getStorage).is.a('function');

    wx.setStorageSync({
      key: 'sid',
      data: 'hello'
    });
    getStorage({
      key: 'sid',
      success(res) {
        expect(res).to.equal('hello world');
        task.done('test-getStorage-success');
      },
      fail() {
        throw new Error('never go here');
      },
      complete(res) {
        expect(res).to.equal('hello complete');
        task.done('test-request-complete');
      }
    });
  });

  it('should callback config promise', function(done) {
    let task = ensureAllTaskDone(['test-getStorage-config', 'test-getStorage-success', 'test-request-complete'], done);

    let wepy = {};
    useInterceptInstall(wepy);

    const timeNow = +new Date();
    const getStorage = wepy.intercept(wepy.wx.getStorage, {
      config(p) {
        p.t = timeNow;
        expect(p.key).to.equal('sid');
        return new Promise(resolve => {
          setTimeout(() => {
            task.done('test-getStorage-config');
            resolve(p);
          });
        });
      },
      success(res) {
        res += ' world';
        return res;
      },
      complete(res) {
        res += ' complete';
        return res;
      }
    });

    expect(getStorage).is.a('function');

    wx.setStorageSync({
      key: 'sid',
      data: 'hello'
    });
    getStorage({
      key: 'sid',
      success(res) {
        expect(res).to.equal('hello world');
        task.done('test-getStorage-success');
      },
      fail() {
        throw new Error('never go here');
      },
      complete(res) {
        expect(res).to.equal('hello complete');
        task.done('test-request-complete');
      }
    });
  });

  it('should callback config promise reject', function(done) {
    let task = ensureAllTaskDone(['test-getStorage-config', 'test-getStorage-fail'], done);

    let wepy = {};
    useInterceptInstall(wepy);

    const timeNow = +new Date();
    const getStorage = wepy.intercept(wepy.wx.getStorage, {
      config(p) {
        p.t = timeNow;
        expect(p.key).to.equal('sid');
        return new Promise((_, reject) => {
          setTimeout(() => {
            task.done('test-getStorage-config');
            reject(new Error('test'));
          });
        });
      },
      fail(e) {
        return new Error(e.message + ' from interceptor');
      },
      success(res) {
        res += ' world';
        return res;
      },
      complete(res) {
        res += ' complete';
        return res;
      }
    });

    expect(getStorage).is.a('function');

    wx.setStorageSync({
      key: 'sid',
      data: 'hello'
    });
    getStorage({
      key: 'sid',
      success() {
        throw new Error('never go here');
      },
      fail(e) {
        expect(e.message).to.equal('test from interceptor');
        task.done('test-getStorage-fail');
      },
      complete() {
        throw new Error('never call complete when interceptor config reject');
      }
    });
  });

  it('should callback failed', function(done) {
    let task = ensureAllTaskDone(['test-request-config', 'test-request-fail', 'test-request-complete'], done);

    let wepy = {};
    useInterceptInstall(wepy);

    const timeNow = +new Date();
    const request = wepy.intercept(wepy.wx.request, {
      config(params) {
        params.t = timeNow;
        task.done('test-request-config');
        expect(params.url).to.equal('www.baidu.com');
        return params;
      },
      fail(e) {
        e.intercept_fail = true;
        return e;
      },
      complete(res) {
        res.intercept_complete = true;
        return res;
      }
    });

    expect(request).is.a('function');
    request({
      url: 'www.baidu.com',
      success() {
        throw new Error('never go here');
      },
      fail(e) {
        expect(e.intercept_fail).to.equal(true);
        task.done('test-request-fail');
      },
      complete(res) {
        expect(res.a).to.equal(1);
        expect(res.intercept_complete).to.equal(true);
        task.done('test-request-complete');
      }
    });
  });

  after(function() {
    delete global.wx;
  });
});
