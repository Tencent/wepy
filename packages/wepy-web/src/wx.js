import Vue from 'vue';
import axios from 'axios';
import {resolveQuery} from './helper/query';

const callback = (type, o, name, data) => {
    if (typeof o[type] === 'function') {
        setTimeout(() => {
            if (name === 'login') {
                o[type].call(wx, {errMsg: name + ':' + (type === 'fail' ? 'fail' : 'ok'), code: data});
            } else {
                o[type].call(wx, {errMsg: name + ':' + (type === 'fail' ? 'fail' : 'ok'), data: data});
            }
        }, 0);
    }
}

let wx = {
    login (o) {
        let code;
        code = resolveQuery(window.location.search).code;
        if (!code) {
            code = resolveQuery(window.location.hash).code;
        }
        if (!code) {
            code = resolveQuery(window.location.hash.substr(window.location.hash.indexOf('?'))).code;
        }
        if (code) {
            callback('success', o, 'login', code);
            return;
        }
        if (o.appId) {
            let url = window.location.protocol + '//' + window.location.host + window.location.pathname,
                state = o.state || 'qqchongzhi',
                type = type || 'snsapi_base';

            window.location = location.protocol + '//open.weixin.qq.com/connect/oauth2/authorize?appid=' + o.appId + 
                '&redirect_uri=' + encodeURIComponent(url) + '&response_type=code&scope=' + type + '&state=' + state + '#wechat_redirect';
        } else {
            console.error('wx.login is only implemented in wechat brower');
        }
    },
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
    },
    hideKeyboard () {
        // http://stackoverflow.com/questions/8335834/how-can-i-hide-the-android-keyboard-using-javascript
        setTimeout(() => {
            let field = document.createElement('input');
            field.setAttribute('type', 'text');
            field.setAttribute('style', 'position:absolute; top: 0px; opacity: 0; -webkit-user-modify: read-write-plaintext-only; left:0px;');
            document.body.appendChild(field);

            field.onfocus = () => {
                setTimeout(() => {
                    field.setAttribute('style', 'display:none;');
                    setTimeout(() => {
                        document.body.removeChild(field);
                        document.body.focus();
                    }, 14);

                }, 200);
            };
            field.focus();
        }, 50);
    }
};

['getUserInfo', 'switchTab', 'showNavigationBarLoading', 'hideNavigationBarLoading', 'createAnimation'].forEach(k => {
    wx[k] = (o = {}) => {
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
    if (!options.method || options.method.toLowerCase() === 'get') {
        options.params = options.data;
        delete options.data;
    }
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

    

    window.getApp = () => {
        return Vue;
    };

    window.getCurrentPages = () => {
        if (wx._currentPage)
            return [wx._currentPage];
        else 
            return [wx._currentPages[0]];
    };
}

export default wx;