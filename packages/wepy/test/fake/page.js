let assert = require('assert');

let wepy = require('../../lib/wepy.js').default;
let Mix = require('./mixin');
let ComA = require('./com_a');

module.exports = class Index extends wepy.page {
    constructor () {
        super(1, 2, 3);
        this.methods = {
            'tap': function (evt) {
                assert.strictEqual(evt.name, 'test_page_tap', 'page tap triggered');
            }
        };
        this.components = {
            coma: ComA
        };
        this.data = {
            'a': 1
        };
        this.mixins = [Mix];
    }
    onShow (args) {
        assert.strictEqual(this instanceof Index, true, 'page onShow triggered, this is self');
        assert.strictEqual(args.p, 1, 'page onShow triggered with params');
    }
    custom (arg) {
        assert.strictEqual(this instanceof Index, true, 'page custom method triggered, this is self');
        assert.strictEqual(arg, 'user_custom', 'page custom method triggered with params');
    }
}