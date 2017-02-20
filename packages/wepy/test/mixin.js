
var assert = require('assert');
var wepy = require('../lib/wepy.js').default;
var mixin = require('../lib/mixin.js').default;
var wxfake = require('./wxfake');
var Index = require('./fake/page');
var App = require('./fake/app');


describe('mixin.js', () => {


    let inst = new mixin();

    it('constructor', () => {
        try {
            let mix = mixin();
        } catch (e) {
            mix = null;
            assert.strictEqual(e instanceof TypeError, true, 'throw a TypeError');
        }
        assert.strictEqual(mix, null, 'mixin can not call as a function');
    });

    it('new', () => {
        assert.strictEqual(Object.keys(inst.data).length, 0, 'mixin default active');
    });

    it('add mixin property', () => {
        inst.data = {a: 1};
        inst.methods = {
            foo: function () {

            }
        }
        assert.strictEqual(inst.data.a, 1, 'mixin data');
    });

    it('init', () => {
        let parent = {data: {b: 2, a: 2}};
        inst.data = {a: 1, c: 1};
        inst.init(parent);

        assert.strictEqual(parent.data.a, 2, 'parent data covered if exsit in parent.');
        assert.strictEqual(parent.data.c, 1, 'mixin data copied if not exsit in parent.');
    });


    it('mixin function', () => {
        let appConfig = wepy.$createApp(App);
        let pageConfig = wepy.$createPage(Index);

        let page = pageConfig.$page;
        let app = appConfig.$app;

        pageConfig.onLoad.call(wxfake.getWxPage());


        assert.strictEqual(page.func1(), 'parent-func1', 'mixin customize function wont copy if parent function exsit.');
        assert.strictEqual(page.func2(), 'mixin-func2', 'mixin customize function will copy if parent function exsit.');

    });

});