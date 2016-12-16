
var assert = require('assert');
var mixin = require('../lib/mixin.js').default;


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

});