let assert = require('assert');

let wepy = require('../../lib/wepy.js').default;


let RepeatInRepeatItem = require('./repeatinrepeat');


module.exports = class RepeatItem extends wepy.component {


    constructor () {
        super();
        this.data = {
        };
        this.computed = {
        };
        this.methods = {
            tap: function (a, b, e) {
                assert.strictEqual(this.ritem.id, 2, 'repeat items events triggered');
                assert.strictEqual(e.name, 'reapt_evt', 'reapt_evt argument number');
                assert.strictEqual(a, '1', 'reapt_evt argument 1');
                assert.strictEqual(b, '2', 'reapt_evt argument 2');
                this.ritem.id = 'changed by repeat item';
            }
        };

        this.components = {
            repeatinrepeat: RepeatInRepeatItem
        }

        this.props = {
            ritem: Object,
            rindex: String,
        };

        this.$props = {
            'repeatinrepeat': { 
                'v-bind:rritem.once': { 'for': 'ritem.list', 'item': 'item', 'index': 'index', 'key': 'key', 'value': 'item' } 
            }
        };
    }

    customMethod () {

    }
}