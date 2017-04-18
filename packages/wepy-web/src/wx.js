const callback = (type, o, name, data) => {
  if (typeof o[type] === 'function') {
      setTimeout(() => {
          o[type].call(wx, {errMsg: name + ':' + (type === 'fail' ? 'fail' : 'ok'), data: data});
      }, 0);
  }
}

let wx = {
  /*** Storage ***/
  getStorageSync (v) {
      let rst = window.localStorage.getItem(v);
      try {
          rst = JSON.parse(rst);
      } catch (e) {
      }
      return rst;
  },
  getStorage (o) {
      let rst = wx.getStorageSync(o.key);
      callback('success', o, 'getStorage', rst);
      callback('complete', o, 'getStorage', rst);
  },
  setStorageSync (k, d) {
    if (typeof d !== 'string') {
      d = JSON.stringify(d);
    }
    window.localStorage.setItem(k, d);
  },
  setStorage (o) {
    let rst;
    try {
      rst = this.setStorageSync(o.key, o.data);
      callback('success', o, 'getStorage', rst);
    } catch (e) {
      callback('fail', o, 'getStorage', rst);
    }
    callback('complete', o, 'getStorage', rst);
  },
  removeStorageSync (k) {
    window.localStorage.removeItem(k);
  },
  removeStorage (o) {
    let rst;
    try {
      rst = this.removeStorage(o.key);
      callback('success', o, 'getStorage', rst);
    } catch (e) {
      callback('fail', o, 'getStorage', rst);
    }
    callback('complete', o, 'getStorage', rst);
  },
  clearStorageSync () {
    window.localStorage.clear();
  },
  clearStorage () {
    let rst;
    try {
      rst = this.clearStorage();
    } catch (e) {
    }
  },

  /***** Navigate ******/
  navigateTo (o) {
    window.$router.go(o.url);
  },
  redirectTo (o) {
    window.$router.go(o.url);
  },
  switchTab (o) {
    window.$router.go(o.url);
  },
  navigateBack (o) {
    if (!o) {
      o = {};
    }
    if (o.delta)
      o.delta = -1;
    window.$router.go(o.delta);
  },

  /****** NavigationBar *******/
  setNavigationBarTitle (o) {
    document.title = o.title;
    callback('success', o, 'setNavigationBarTitle', null);
    callback('complete', o, 'setNavigationBarTitle', null);
  }
};

['getUserInfo', 'login', 'switchTab', 'showNavigationBarLoading', 'hideNavigationBarLoading', 'createAnimation'].forEach(k => {
  wx[k] = (o) => {
    console.error(`wx.${k} is not supported in brower`);
    callback('fail', o, k, null);
    callback('complete', o, k, null);
  };
});

wx.request = (options) => {
    let handlers = {};
    ['success', 'fail', 'complete', 'beforeAll', 'beforeSuccess', 'afterSuccess', 'beforeCancel', 'cancel', 'afterCancel', 'beforeFail', 'afterFail', 'afterAll'].forEach(k => {
        handlers[k] = options[k];
        delete options[k];
    });
    let rst = {errMsg: 'request', statusCode: 0, data: undefined};
    axios(options).then(res => {
        rst.errMsg = rst.errMsg + ':ok';
        rst.statusCode = res.status;
        rst.data = res.data;

        // WAService.js
        if (typeof handlers.beforeAll === 'function') {
            handlers.beforeAll(res);
        }
        if (typeof handlers.beforeSuccess === 'function') {
            handlers.beforeSuccess(res);
        }
        if (typeof handlers.success === 'function') {
            handlers.success(res);
        }
        if (typeof handlers.afterSuccess === 'function') {
            handlers.afterSuccess(res);
        }
        if (typeof handlers.complete === 'function') {
            handlers.complete(res);
        }
        if (typeof handlers.afterAll === 'function') {
            handlers.afterAll(res);
        }
    }).catch(res => {
        if (typeof handlers.beforeAll === 'function') {
            handlers.beforeAll(res);
        }
        if (axios.isCancel(res)) {
            rst.errMsg = rst.errMsg + ':cancel';
            if (typeof handlers.fail === 'function') {
                handlers.fail(res);
            }
            if (typeof handlers.beforeCancel === 'function') {
                handlers.beforeCancel(res);
            }
            if (typeof handlers.cancel === 'function') {
                handlers.cancel(res);
            }
            if (typeof handlers.afterCancel === 'function') {
                handlers.afterCancel(res);
            }
        } else {
            rst.errMsg = rst.errMsg + ':fail';
            if (typeof handlers.beforeFail === 'function') {
                handlers.beforeFail(res);
            }
            if (typeof handlers.fail === 'function') {
                handlers.fail(res);
            }
            if (typeof handlers.afterFail === 'function') {
                handlers.afterFail(res);
            }
        }
        rst.data = res;
        if (typeof handlers.complete === 'function') {
            handlers.complete(res);
        }
        if (typeof handlers.afterAll === 'function') {
            handlers.afterAll(res);
        }
    })
};

if (typeof window !== 'undefined') {
  window.wx = wx;
}

export default wx;