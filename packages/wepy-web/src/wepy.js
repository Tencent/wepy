import Vue from 'vue';
import axios from 'axios';
import app from './app';
import page from './page';
import component from './component';
import event from './event';
import base from './base';
import util from './util';
import mixin from './mixin';


window.getApp = () => {
    return Vue;
};

window.wx = {};

window.wx.request = (options) => {

};

wx.getUserInfo = () => {
    console.error('getUserInfo is not supported in browser.');
    //throw 'getUserInfo is not supported in browser.';
};

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
}


export default {
    event: event,
    app: app,
    component: component,
    page: page,
    mixin: mixin,

    $createApp: base.$createApp,
    $createPage: base.$createPage,

    $isEmpty: util.$isEmpty,
    $isEqual: util.$isEqual,
    $isDeepEqual: util.$isDeepEqual,
    $has: util.$has,
    $extend: util.$extend,
    $isPlainObject: util.$isPlainObject,
    $copy: util.$copy,
};


