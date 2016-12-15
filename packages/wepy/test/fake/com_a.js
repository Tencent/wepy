let assert = require('assert');

let wepy = require('../../lib/wepy.js').default;

let ComAA = require('./com_a_a');

module.exports = class Com extends wepy.component {
    constructor () {
        super();
        this.data = {
            'a': 1
        };
        this.methods = {
            'tap': function (evt, a, b) {
                assert.strictEqual(evt.name, 'test_com_tap', 'com tap triggered');
                assert.strictEqual(a, 1, 'com tap triggered with addtional params');
                assert.strictEqual(b, 2, 'com tap triggered with addtional params');
            }
        };

        this.components = {
            comaa: ComAA
        }
    }

    customMethod () {

    }
}