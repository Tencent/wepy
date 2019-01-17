const expect = require('chai').expect;
const usePromisify = require('../dist/index');


function ensureAllTaskDone(taskList, done) {
  let tasks = {};
  taskList.forEach(v => tasks[v] = false);

  let _interval = setInterval(function () {
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
    done: function (key) {
      tasks[key] = true;
    }
  };
}

describe('wepy-use-promisify', function() {

  let wepy = {};

  let __storage = {
    mydata: {a: 1}
  };

  let wx = {
    request: function (option) {
      setTimeout(() => {
        (option.fail && option.fail(new Error('timeout')));
        (option.complete && option.complete({a: 1}));
      }, 1000);
    },
    getStorage: function (option) {
      setTimeout(() => {
        let res = __storage[option.key];
        (option.success && option.success(res));
        (option.complete && option.complete(res));
      })
    },
    setStorage: function (option) {
      setTimeout(() => {
        __storage[option.key] = option.data;
        (option.success && option.success());
        (option.complete && option.complete());
      });
    },
    getStorageSync: function (key) {
      let res = __storage[key];
      return res;
    },
    someNewAPI: function (option) {
      setTimeout(() => {
        option.success(option.num);
      });
    },
    someWxAPI: function (option) {
      setTimeout(() => {
        (option.success && option.success(option));
      });
    }
  };

  before(function() {
    global.wx = wx;
  });

  it('install', function (done) {

    let task = ensureAllTaskDone([
      'test-request-catch',
      'test-storage'
    ], done);

    let wepy = {};
    usePromisify.install(wepy);

    expect(wepy.wx.request).is.a('function');

    let promise = wepy.wx.request();

    expect(promise).is.a('promise');

    promise.catch(e => {
      expect(e).is.an('error');
      expect(e.message).to.equal('timeout');
      task.done('test-request-catch');
    });

    wepy.wx.getStorage({key: 'mydata'}).then((res) => {
      expect(res).to.deep.equal(__storage.mydata);
      task.done('test-storage');
    });

    expect(wepy.wx.getStorageSync('mydata')).to.deep.equal(__storage.mydata);

  });

  it('install appends array list', function (done) {
    let wepy = {};

    usePromisify.install(wepy, {someNewAPI: false, getStorage: true});

    wepy.wx.someNewAPI({num: 1}).then(res => {
      expect(res).to.equal(1);
      done();
    });

  });

  it('install get rid apis', function (done) {
    let wepy = {};
    usePromisify.install(wepy, ['getStorage']);
    wepy.wx.getStorage({
      key: 'mydata',
      success: function (res) {
        expect(res).is.deep.equal(__storage.mydata);
        done();
      }
    });
  });

  it('params fix testing', function (done) {

    let wepy = {};
    usePromisify.install(wepy);

    wepy.wx.setStorage('mydata', {b : 1}).then(res => {
      wepy.wx.getStorage('mydata').then(res => {
        expect(res).to.deep.equal({b: 1});
        expect(__storage.mydata).to.deep.equal(res);
        done();
      })
    })
  });

  it('test err-first promisify', function (done) {

    let task = ensureAllTaskDone([
      'test-greater',
      'test-less'
    ], done);


    let isGreaterThan10 = function (num, callback) {
      setTimeout(function () {
        if (num > 10) {
          callback(null, true);
        } else {
          callback(new Error('wrong'), false);
        }
      }, 300);
    }

    let wepy = {};
    usePromisify.install(wepy);

    let promisifyFn = wepy.promisify(isGreaterThan10, null, 'error-first');

    promisifyFn(11).then(res => {
      expect(res).to.equal(true);
      task.done('test-greater');
    });

    promisifyFn(9).then(res => {
      throw new Error('should not run here');
    }).catch(e => {
      expect(e).is.an('error');
      expect(e.message).to.equal('wrong');
      task.done('test-less');
    });

  });

  it('test weapp-style promisify', function (done) {

    let task = ensureAllTaskDone([
      'test-greater',
      'test-less'
    ], done);

    let isGreaterThan10 = function (option) {
      if (option.num > 10) {
        option.success(true);
      } else {
        option.fail(new Error('wrong'));
      }
    };

    let wepy = {};
    usePromisify.install(wepy);

    let promisifyFn = wepy.promisify(isGreaterThan10);

    promisifyFn({num: 11}).then(res => {
      expect(res).to.equal(true);
      task.done('test-greater');
    });

    promisifyFn({num: 9}).then(res => {
      throw new Error('should not run here');
    }).catch(e => {
      expect(e).is.an('error');
      expect(e.message).to.equal('wrong');
      task.done('test-less');
    });

  });

  it('test simplify', function (done) {
    let wepy = {},
      originParamsArr = [
        {
          key1: 0,
          key2: 0
        },
        {
          key1: ['A', 'B', 'C'],
          key2: '#000'
        },
        {
          key1: 'test?id=1'
        }
      ],
      task = ensureAllTaskDone((function () {
        return originParamsArr.map((item, index) => index)
      })(), done);

    usePromisify.install(wepy);

    for (let item of originParamsArr) {
      let filterParams = Object.values(item)
      wepy.wx.someWxAPI(...filterParams).then(res => {
        delete(res.success)
        delete(res.fail)
        expect(res).to.deep.equal(item);
        task.done(originParamsArr.indexOf(item));
      }).catch(e => {
        console.log(e)
      });
    }
  });

  after(function () {
    delete global.wx;
  });

});
