var assert = require('assert');
var wepy = require('../lib/wepy.js').default;
var wxfake = require('./wxfake');

var Index = require('./fake/page');
var App = require('./fake/app');


describe('page.js', () => {

    it('constructor', () => {
        try {
            let inst = Index();
        } catch (e) {
            inst = null;
            assert.strictEqual(e instanceof TypeError, true, 'throw a TypeError');
        }
        assert.strictEqual(inst, null, 'Page can not call as a function');
    });

    it('wx instance', () => {
        let appConfig = wepy.$createApp(App);
        let pageConfig = wepy.$createPage(Index);

        let page = pageConfig.$page;

        pageConfig.onLoad.call(wxfake.getWxPage());

        assert.strictEqual(page.$wxapp.app, 'app', 'wxapp equal getApp()');
        assert.strictEqual(page.$wxpage.getCurrentPages(), 'wxpage', 'wxpage equal wxpages');

    });

    it('new', () => {

        let page = new Index();

        assert.strictEqual(page instanceof Index, true, 'create a page instance');

        assert.strictEqual(page.isComponent, false, 'page is not a component');

    });


    it('props', () => {
        let pageConfig = wepy.$createPage(Index);
        let page = pageConfig.$page;

        pageConfig.onLoad.call(wxfake.getWxPage());

        assert.strictEqual(page.$com.coma.comprop2, 'static props', 'static props checking');

        assert.strictEqual(page.$com.coma.comprop3, 123, 'coerce change string to int');

        assert.strictEqual(page.$com.coma.comprop4.a, 1, 'test object prop');

        assert.strictEqual(page.$com.coma.comprop5, 60, 'test prop static default value');

        assert.strictEqual(page.$com.coma.staticDefault, 'static', 'test prop static default value again');

        assert.strictEqual(page.$com.coma.funcProp, 'func', 'test prop function default value');

        assert.strictEqual(page.$com.coma.staticAndCoerce, 2, 'test prop default value with coerce');

        
        
        assert.strictEqual(page.$com.coma.onceProp, '50', 'test once prop validate');
        assert.strictEqual(page.$com.coma.syncProp, '50', 'test sync prop validate');
        assert.strictEqual(page.$com.coma.twoWayProp, '50', 'test two way prop validate');

        page.$com.coma.onceProp = 80;
        page.$com.coma.$apply();

        assert.strictEqual(page.testValid, '50', 'child prop.once changed will not change parent props');

        page.testValid = 90;
        page.$apply();


        assert.strictEqual(page.$com.coma.onceProp, 80, 'parent prop.once changed will not change child props');
        assert.strictEqual(page.$com.coma.twoWayProp, '50', 'parent prop.once changed will not change child props, even child prop is two way');

        
        assert.strictEqual(page.$com.coma.syncProp, 90, 'parent prop.sync changed will change child props');

        page.$com.coma.syncProp = 91;
        page.$com.coma.$apply();

        assert.strictEqual(page.testValid, 90, 'child prop changed will not change parent prop.sync');


        page.$com.coma.twoWayProp = 92;
        page.$com.coma.$apply();
        assert.strictEqual(page.testValid, 92, 'child two way prop changed will change parent prop even it is once prop');

        assert.strictEqual(page.$com.coma.syncProp, 92, 'sync prop changed, because parent prop changed');





        assert.strictEqual(page.$com.coma.$com.comaa.comaaprop, 92, 'prop goes to all children');

        page.$com.coma.$com.comaa.comaaprop = 100;
        page.$com.coma.$com.comaa.$apply();

        assert.strictEqual(page.$com.coma.twoWayProp, 100, 'parent prop changed will trigger child data changed');
        assert.strictEqual(page.testValid, 100, 'child prop changed will trigger parent data changed');

    });

});