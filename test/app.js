
var assert = require('assert');
var app = require('../lib/app.js').default;
var wxfake = require('./wxfake');


wxfake.resetGlobal();

describe('app.js', () => {

    let inst = new app();

    it('new', () => {
        assert.strictEqual(typeof inst.init, 'function', 'new instance');
    });

    it('init', () => {
        inst.init();
        //console.log(inst.$wxapp);console.log(global.getApp());
        assert.strictEqual(inst.$wxapp.app, global.getApp().app, 'app init');
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

/*
    it('transfor', () => {
        let inst = new event();
        inst.$transfor({a:1});
        assert.strictEqual(inst.a, 1, 'event transfor');

    });

    it('constructor', () => {
        try {
            let inst = event();
        } catch (e) {
            inst = null;
            assert.strictEqual(e instanceof TypeError, true, 'throw a TypeError');
        }
        assert.strictEqual(inst, null, 'event can not call as a function');
    });*/
});