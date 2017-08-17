import Vue from 'vue';
import axios from 'axios';
import {resolveQuery} from './helper/query';
import {browser, system} from './helper/device';

const callback = (type, o, name, data) => {
    if (typeof o[type] === 'function') {
        setTimeout(() => {
            if (name === 'login') {
                o[type].call(wx, {errMsg: name + ':' + (type === 'fail' ? 'fail' : 'ok'), code: data.code, data: data});
            } else if (name === 'getSystemInfo') {
                o[type].call(wx, data);
            } else {
                o[type].call(wx, {errMsg: name + ':' + (type === 'fail' ? 'fail' : 'ok'), data: data});
            }
        }, 0);
    }
}


let wx = window.wx || {};

wx.login = wx.login || function login (o) {
    console.error('wx.login is only implemented in browser');
};

/*** Storage ***/
wx.getStorageSync = wx.getStorageSync || function getStorageSync (v) {
    let rst = window.localStorage.getItem(v);
    try {
            rst = JSON.parse(rst);
    } catch (e) {
    }
    return rst;
};
wx.getStorage = wx.getStorage || function getStorage (o) {
    let rst = wx.getStorageSync(o.key);
    callback('success', o, 'getStorage', rst);
    callback('complete', o, 'getStorage', rst);
};
wx.setStorageSync = wx.setStorageSync || function setStorageSync (k, d) {
    if (typeof d !== 'string') {
        d = JSON.stringify(d);
    }
    window.localStorage.setItem(k, d);
};
wx.setStorage = wx.setStorage || function setStorage (o) {
    let rst;
    try {
        rst = this.setStorageSync(o.key, o.data);
        callback('success', o, 'getStorage', rst);
    } catch (e) {
        callback('fail', o, 'getStorage', rst);
    }
    callback('complete', o, 'getStorage', rst);
};
wx.getStorageInfoSync = wx.getStorageInfoSync || function getStorageInfoSync () {
    let MAX_SIZE = 5 * 1024;
    let keys = Object.keys(window.localStorage);
    return {
        currentSize: 1,
        keys: keys,
        limitSize: MAX_SIZE
    };
};
wx.getStorageInfo = wx.getStorageInfo || function getStorageInfo (o) {
    let rst = this.getStorageInfoSync();
    callback('success', o, 'getStorageInfo', rst);
    callback('complete', o, 'getStorageInfo', rst);
};
wx.removeStorageSync = wx.removeStorageSync || function removeStorageSync (k) {
    window.localStorage.removeItem(k);
};
wx.removeStorage = wx.removeStorage || function removeStorage (o) {
    let rst;
    try {
        rst = this.removeStorage(o.key);
        callback('success', o, 'getStorage', rst);
    } catch (e) {
        callback('fail', o, 'getStorage', rst);
    }
    callback('complete', o, 'getStorage', rst);
};
wx.clearStorageSync = wx.clearStorageSync || function clearStorageSync () {
    window.localStorage.clear();
};
wx.clearStorage = wx.clearStorage || function clearStorage () {
    let rst;
    try {
        rst = this.clearStorage();
    } catch (e) {
    }
};

    /***** Navigate ******/
wx.navigateTo = wx.navigateTo || function navigateTo (o) {
    window.$router.go(o.url);
};
wx.redirectTo = wx.redirectTo || function redirectTo (o) {
    window.$router.go(o.url);
};
wx.switchTab = wx.switchTab || function switchTab (o) {
    window.$router.go(o.url);
};
wx.navigateBack = wx.navigateBack || function navigateBack (o) {
    if (!o) {
        o = {};
    }
    if (o.delta)
        o.delta = -1;
    window.$router.go(o.delta);
};

    /***** System ******/
wx.getSystemInfoSync = wx.getSystemInfoSync || function getSystemInfoSync () {
    return {
        SDKVersion: '0.0.0',
        language: '-',
        model: browser(),
        pixelRatio: 0,
        platform: system(),
        screenHeight: window.screen.height,
        screenWidth: window.screen.width,
        system: system(),
        version: '0.0.0',
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth
    }
};
wx.getSystemInfo = wx.getSystemInfo || function getSystemInfo (o) {
    let rst = this.getSystemInfoSync();
    callback('success', o, 'getSystemInfo', rst);
    callback('complete', o, 'getSystemInfo', rst);
};
wx.canIUse = wx.canIUse || function canIUse () {
    return true;
};

    /****** Network ***********/
wx.getNetworkType = wx.getNetworkType || function getNetworkType () {
    return 'unkown';
};

    /****** NavigationBar *******/
wx.setNavigationBarTitle = wx.setNavigationBarTitle || function setNavigationBarTitle (o) {
    document.title = o.title;
    callback('success', o, 'setNavigationBarTitle', null);
    callback('complete', o, 'setNavigationBarTitle', null);
};

wx.makePhoneCall = wx.makePhoneCall || function makePhoneCall (o) {
    window.location = 'tel:' + o.phoneNumber;
    callback('success', o, 'makePhoneCall', null);
    callback('complete', o, 'makePhoneCall', null);
};

wx.hideKeyboard = wx.hideKeyboard || function hideKeyboard () {
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
};

['getUserInfo', 'switchTab', 'showNavigationBarLoading', 'hideNavigationBarLoading', 'createAnimation', 'requestPayment', 'chooseImage', 'showModal', 'showToast', 'showActionSheet'].forEach(k => {
    if (!wx[k]) {
        wx[k] = (o = {}) => {
            console.error(`wx.${k} is not supported in browser or you did add it in config.`);
            callback('fail', o, k, null);
            callback('complete', o, k, null);
        };
    }
});

wx.request = wx.request ? wx.request : function request (options) {
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

window.wx = wx;

export default wx;