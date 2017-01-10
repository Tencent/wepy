
var assert = require('assert');
var app = require('../lib/app').default;
var wepy = require('../lib/wepy').default;
var App = require('./fake/app');
var wxfake = require('./wxfake');


wxfake.resetGlobal();

describe('app.js', () => {

    it('new', () => {
        let inst = new app();
        assert.strictEqual(typeof inst.init, 'function', 'new instance');
    });


    it('wx instance', () => {
        let appConfig = wepy.$createApp(App);
        let app = appConfig.$app;
        
        assert.strictEqual(app.$wxapp.app, 'app', 'wxapp equal getApp()');
    });

    it('api call success', () => {
        let params = {};
        let promise = wx.getUserInfo(params).then(rst => {
            assert.strictEqual(rst.name, 'gcaufy', 'wx.getUserInfo get value');
        });
        assert.strictEqual(promise instanceof Promise, true, 'it\'s a Promise');
        assert.strictEqual(typeof params.success, 'function', 'params success function');
        params.success({name: 'gcaufy'}); 
    });

    it('api call fail', () => {
        let params = {};
        let promise = wx.getUserInfo(params).catch(e => {
            assert.strictEqual(e.msg, 'wrong', 'wx.getUserInfo get value fail');
        });
        assert.strictEqual(promise instanceof Promise, true, 'it\'s a Promise');
        assert.strictEqual(typeof params.fail, 'function', 'params fail function');
        params.fail({msg: 'wrong'}); 



        params = {};
        promise = wx.getUserInfo(params).catch(e => {
            assert.strictEqual(e.message, 'wrongMsg', 'wx.getUserInfo get value fail');
        });
        assert.strictEqual(promise instanceof Promise, true, 'it\'s a Promise');
        assert.strictEqual(typeof params.fail, 'function', 'params fail function');
        params.fail({errMsg: 'wrongMsg'}); 
        
    });


    it('api request', () => {
        let params = {url: 'http://www.baidu.com', complete (res) {
            assert.strictEqual(res.name, 'gcaufy', 'wx.request complete callback');
        }};
        let promise = wx.request(params).then(rst => {
            assert.strictEqual(rst.name, 'gcaufy', 'wx.getUserInfo get value');
        });
        assert.strictEqual(promise instanceof Promise, true, 'it\'s a Promise');
        assert.strictEqual(typeof params.success, 'function', 'params success function');
        assert.strictEqual(typeof params.complete, 'function', 'params complete function');
        params.complete({name: 'gcaufy'}); 



        params = 'http://www.baidu.com';
        promise = wx.request(params);
        assert.strictEqual(promise instanceof Promise, true, 'params is a string');

        promise = wx.request();
        assert.strictEqual(promise instanceof Promise, true, 'without params');
    });


    it('api request fail', () => {
        let params = {url: 'http://www.baidu.com', complete (res) {
            assert.strictEqual(res.name, 'gcaufy', 'wx.request complete callback');
        }};
        let promise = wx.request(params).catch(e => {
            assert.strictEqual(e.message, 'wrongMsg', 'wx.getUserInfo get value');
        });
        assert.strictEqual(promise instanceof Promise, true, 'it\'s a Promise');
        assert.strictEqual(typeof params.success, 'function', 'params success function');
        assert.strictEqual(typeof params.complete, 'function', 'params complete function');
        params.fail({errMsg: 'wrongMsg'}); 


        promise = wx.request(params).catch(e => {
            assert.strictEqual(e.msg, 'wrong', 'wx.getUserInfo get value');
        });
        params.fail({msg: 'wrong'}); 
    });

});