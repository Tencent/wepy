var assert = require('assert');
var wepy = require('../lib/wepy.js').default;
var wxfake = require('./wxfake');

var Index = require('./fake/page');


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

        assert.strictEqual(page.$com.coma.comprop5, 60, 'test prop default value');
        
        assert.strictEqual(page.$com.coma.comprop6, 70, 'test prop validate');

        page.$com.coma.comprop6 = 80;
        page.$com.coma.$apply();

        assert.strictEqual(page.testValid, 80, 'child prop changed will trigger parent data changed');

        page.testValid = 90;
        page.$apply();

        assert.strictEqual(page.$com.coma.comprop6, 90, 'parent prop changed will trigger child data changed');


        assert.strictEqual(page.$com.coma.$com.comaa.comaaprop, 90, 'prop goes to all children');

        page.$com.coma.$com.comaa.comaaprop = 100;
        page.$com.coma.$com.comaa.$apply();

        assert.strictEqual(page.$com.coma.comprop6, 100, 'parent prop changed will trigger child data changed');
        assert.strictEqual(page.testValid, 100, 'child prop changed will trigger parent data changed');

    });

});