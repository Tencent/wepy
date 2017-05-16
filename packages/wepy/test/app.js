
var assert = require('assert');
var app = require('../lib/app').default;
var wepy = require('../lib/wepy').default;
var App = require('./fake/app');
var wxfake = require('./wxfake');


wxfake.resetGlobal();

describe('app.js', () => {


    let appConfig = wepy.$createApp(App);
    let app = appConfig.$app;



    it('wx instance', () => {
        assert.strictEqual(app.$wxapp.app, 'app', 'wxapp equal getApp()');

        assert.strictEqual(typeof wepy.getUserInfo, 'function', 'api init');
    });


    it('api call', () => {
        wepy.getUserInfo({
            success: function (res) {
                assert.strictEqual(res.name, 'fakeID', 'wepy.getUserInfo success');
            }
        });

        wepy.login({
            fail: function (res) {
                assert.strictEqual(res.code, 'xxx', 'wepy.login fail');
            }
        });

        wepy.request({
            data: {
                number: 1
            },
            success: function (res) {
                assert.strictEqual(res.number, 1, 'wepy.request success');
            }
        });

        assert.strictEqual(wepy.createCanvasContext(), 'createCanvasContext', 'wepy.createCanvasContext called');
    });


    it('api use promisify', () => {

        app.use('promisify');

        assert.strictEqual(wepy.getUserInfo() instanceof Promise, true, 'it\'s a Promise');

        wepy.getUserInfo().then(function (res) {
            assert.strictEqual(res.name, 'fakeID', 'wepy.getUserInfo promisify success');
        });

        wepy.login().then(function (res) {
        }).catch(function (res) {
            assert.strictEqual(res.code, 'xxx', 'wepy.login promisify fail');
        });

        wepy.request({data: {number: 2}}).then(function (res) {
            assert.strictEqual(res.number, 2, 'wepy.request success');
        });

        assert.strictEqual(wepy.createCanvasContext(), 'createCanvasContext', 'wepy.createCanvasContext called');

    });

    it('api use requestfix', () => {

        app.$addons.promisify = undefined;
        app.use('requestfix');

        assert.strictEqual(wepy.getUserInfo() instanceof Promise, false, 'it\'s not a Promise');

        wepy.request({
            data: {
                number: 1
            },
            success: function (res) {
                assert.strictEqual(res.number, 1, 'wepy.request 1 success');
            }
        });
        wepy.request({
            data: {
                number: 2
            },
            success: function (res) {
                assert.strictEqual(res.number, 2, 'wepy.request 2 success');
            }
        });
        wepy.request({
            data: {
                number: 3
            },
            success: function (res) {
                assert.strictEqual(res.number, 3, 'wepy.request 3 success');
            }
        });
        wepy.request({
            data: {
                number: 4
            },
            success: function (res) {
                assert.strictEqual(res.number, 4, 'wepy.request 4 success');
            }
        });
        wepy.request({
            data: {
                number: 5
            },
            success: function (res) {
                assert.strictEqual(res.number, 5, 'wepy.request 5 success');
            }
        });
        wepy.request({
            data: {
                number: 6
            },
            success: function (res) {
                assert.strictEqual(res.number, 6, 'wepy.request 6 success');
            }
        });
    });



    it('api use both requestfix and promisify', () => {

        app.use('promisify');
        app.use('requestfix');

        assert.strictEqual(wepy.getUserInfo() instanceof Promise, true, 'it\'s a Promise');

        wepy.request({data: {number: 1}}).then(function (res) {
            assert.strictEqual(res.number, 1, 'wepy.request 1 success');
        });
        wepy.request({data: {number: 2}}).then(function (res) {
            assert.strictEqual(res.number, 2, 'wepy.request 2 success');
        });
        wepy.request({data: {number: 3}}).then(function (res) {
            assert.strictEqual(res.number, 3, 'wepy.request 3 success');
        });
        wepy.request({data: {number: 4}}).then(function (res) {
            assert.strictEqual(res.number, 4, 'wepy.request 4 success');
        });
        wepy.request({data: {number: 5}}).then(function (res) {
            assert.strictEqual(res.number, 5, 'wepy.request 5 success');
        });
        wepy.request({data: {number: 6}}).then(function (res) {
            assert.strictEqual(res.number, 6, 'wepy.request 6 success');
        });
        wepy.request({data: {number: 7}}).then(function (res) {
            assert.strictEqual(res.number, 7, 'wepy.request 7 success');
        });

    });


    it('api intercept return false', () => {

        app.$addons.promisify = undefined;
        app.$addons.requestfix = undefined;

        app.intercept('request', {
            config: function (p) {
                return false;
            }
        });
        wepy.request({
            data: {number: 1},
            success: function (res) {
                assert.strictEqual(res.number, 2222222, 'Should not go here');
            },
            fail: function (e) {
                assert.strictEqual(e, 'aborted by interceptor', 'wepy.request intercept test success');
            }
        });

        app.use('promisify');
        app.use('requestfix');

        wepy.request({data: {number: 1}}).then(function (res) {
            assert.strictEqual(res.number, 2222222, 'Should not go here');
        }).catch(function (e) {
            assert.strictEqual(e, 'aborted by interceptor', 'wepy.request intercept test success');
        });
    });


    it('api intercept', () => {

        app.$addons.promisify = undefined;
        app.$addons.requestfix = undefined;

        app.intercept('request', {
            config: function (p) {
                p.data.number++;
                return p;
            },
            success: function (p) {
                p.number++;
                return p;
            }
        });
        wepy.request({
            data: {number: 1},
            success: function (res) {
                assert.strictEqual(res.number, 3, 'wepy.request intercept test success');
            },
            fail: function (e) {
                assert.strictEqual(e, 2222222, 'Should not go here');
            }
        });

        app.use('promisify');
        app.use('requestfix');

        wepy.request({data: {number: 1}}).then(function (res) {
            assert.strictEqual(res.number, 3, 'wepy.request promisfy intercept test success');
        }).catch(function (e) {
            assert.strictEqual(e, 'aborted by interceptor wrong', 'Should not go here');
        });

    });


    it('api use 3rd part', () => {

        let C = function () {
            this.name = 'addon';
        };

        app.use(C, 1, 2, 3);

        assert.strictEqual(app.$addons.C.name, 'addon', '3rd part addon');

    });





});