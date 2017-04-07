let assert = require('assert');

let wepy = require('../../lib/wepy.js').default;

module.exports = class Com extends wepy.component {
    constructor () {
        super();
        this.data = {
            'a': 1
        };
        this.methods = {
            'tap': function (evt) {
                assert.strictEqual(evt.name, 'test_com_tap', 'com tap triggered');
            },
            'testInvoke': function (arg1, arg2, evt) {
                assert.strictEqual(arguments.length, 3, 'testInvoke argument number');
                assert.strictEqual(arg1, 'arg1', 'testInvoke argument 1');
                assert.strictEqual(arg2, 'arg2', 'testInvoke argument 2');
                assert.strictEqual(evt.type, 'invoke', 'testInvoke event type');
            }
        };



        this.props = {
            'comaaprop': {
                twoWay: true
            }
        };
    }

    customMethod () {

    }

    testCustomInvoke (arg1, arg2) {
        assert.strictEqual(arguments.length, 2, 'testCustomInvoke argument number');
        assert.strictEqual(arg1, 'arg1', 'testCustomInvoke argument 1');
        assert.strictEqual(arg2, 'arg2', 'testCustomInvoke argument 2');
    }
}
