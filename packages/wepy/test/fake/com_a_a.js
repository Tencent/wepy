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
}