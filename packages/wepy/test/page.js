var assert = require('assert');
var wepy = require('../lib/wepy.js').default;

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
});