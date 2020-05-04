const expect = require('chai').expect;
const useIntercept = require('../dist/index');
// const usePromisify = require('../dist/index');

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

describe('@wepy/use-intercept', function() {
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

  it('test callback success', function(done) {
    let task = ensureAllTaskDone(['test-getStorage-config', 'test-getStorage-success', 'test-request-complete'], done);

    let wepy = {};
    useIntercept.install(wepy);

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

  it('test callback config promise', function(done) {
    let task = ensureAllTaskDone(['test-getStorage-config', 'test-getStorage-success', 'test-request-complete'], done);

    let wepy = {};
    useIntercept.install(wepy);

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

  it('test callback failed', function(done) {
    let task = ensureAllTaskDone(['test-request-config', 'test-request-fail', 'test-request-complete'], done);

    let wepy = {};
    useIntercept.install(wepy);

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

  /*
  it('install appends array list', function(done) {
    let wepy = {};

    usePromisify.install(wepy, { someNewAPI: false, getStorage: true });

    wepy.wx.someNewAPI({ num: 1 }).then(res => {
      expect(res).to.equal(1);
      done();
    });
  });

  it('install get rid apis', function(done) {
    let wepy = {};
    usePromisify.install(wepy, ['getStorage']);
    wepy.wx.getStorage({
      key: 'mydata',
      success: function(res) {
        expect(res).is.deep.equal(__storage.mydata);
        done();
      }
    });
  });

  it('params fix testing', function(done) {
    let wepy = {};
    usePromisify.install(wepy);

    wepy.wx.setStorage('mydata', { b: 1 }).then(() => {
      wepy.wx.getStorage('mydata').then(res => {
        expect(res).to.deep.equal({ b: 1 });
        expect(__storage.mydata).to.deep.equal(res);
        done();
      });
    });
  });

  it('test err-first promisify', function(done) {
    let task = ensureAllTaskDone(['test-greater', 'test-less'], done);

    let isGreaterThan10 = function(num, callback) {
      setTimeout(function() {
        if (num > 10) {
          callback(null, true);
        } else {
          callback(new Error('wrong'), false);
        }
      }, 300);
    };

    let wepy = {};
    usePromisify.install(wepy);

    let promisifyFn = wepy.promisify(isGreaterThan10, null, 'error-first');

    promisifyFn(11).then(res => {
      expect(res).to.equal(true);
      task.done('test-greater');
    });

    promisifyFn(9)
      .then(() => {
        throw new Error('should not run here');
      })
      .catch(e => {
        expect(e).is.an('error');
        expect(e.message).to.equal('wrong');
        task.done('test-less');
      });
  });

  it('test weapp-style promisify', function(done) {
    let task = ensureAllTaskDone(['test-greater', 'test-less'], done);

    let isGreaterThan10 = function(option) {
      if (option.num > 10) {
        option.success(true);
      } else {
        option.fail(new Error('wrong'));
      }
    };

    let wepy = {};
    usePromisify.install(wepy);

    let promisifyFn = wepy.promisify(isGreaterThan10);

    promisifyFn({ num: 11 }).then(res => {
      expect(res).to.equal(true);
      task.done('test-greater');
    });

    promisifyFn({ num: 9 })
      .then(() => {
        throw new Error('should not run here');
      })
      .catch(e => {
        expect(e).is.an('error');
        expect(e.message).to.equal('wrong');
        task.done('test-less');
      });
  });

  it('test simplify', function(done) {
    let wepy = {},
      originParamsArr = [
        {
          itemList: 0,
          itemColor: 0
        },
        {
          itemList: ['A', 'B', 'C'],
          itemColor: '#000'
        },
        {
          itemList: 'test?id=1'
        }
      ],
      task = ensureAllTaskDone(
        (function() {
          return originParamsArr.map((item, index) => index);
        })(),
        done
      );

    usePromisify.install(wepy);

    for (let item of originParamsArr) {
      let filterParams = Object.values(item);
      wepy.wx
        .showActionSheet(...filterParams)
        .then(res => {
          delete res.success;
          delete res.fail;
          expect(res).to.deep.equal(item);
          task.done(originParamsArr.indexOf(item));
        })
        .catch(e => {
          // eslint-disable-next-line no-console
          console.log(e);
        });
    }
  });

  */

  after(function() {
    delete global.wx;
  });
});
