let assert = require('assert');

let wepy = require('../../lib/wepy.js').default;


module.exports = class RepeatInRepeat extends wepy.component {


    constructor () {
        super();
        this.data = {
        };
        this.computed = {
        };
        this.methods = {
            tap: function (a, e) {
                assert.strictEqual(this.rritem.childid, '2.2', 'repeat in repeat items events triggered');
                assert.strictEqual(e.name, 'repeat_in_repeat_evt', 'repeat_in_repeat_evt argument number');
                assert.strictEqual(a, '100', 'repeat_in_repeat_evt argument 1');
            },
            tap2: function (e) {
                assert.strictEqual(this.rritem.childid, '2.3', 'repeat in repeat items events triggered');
                assert.strictEqual(e.name, 'repeat_in_repeat_evt_again', 'repeat_in_repeat_evt_again argument number');
            }
        };

        this.components = {
        }

        this.props = {
            rritem: Object,
        };

        this.$props = {
        };
    }

    customMethod () {

    }
}