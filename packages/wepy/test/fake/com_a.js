let assert = require('assert');

let wepy = require('../../lib/wepy.js').default;

let ComAA = require('./com_a_a');


function Car() {

}
Car.prototype.run = function () {}

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

        this.props = {
            comprop1: String,
            comprop2: [Number, String, Boolean],
            comprop3: {
                coerce: function (v) {
                    return +v;
                },
                default: 50
            },
            comprop4: Object,
            comprop5: {
                default: 60
            },
            onceProp: {
                default: 70
            },
            staticDefault: {
                default: 'static'
            },
            funcProp: {
                default: function () {
                    return 'func';
                }
            },
            staticAndCoerce: {
                default: 1,
                coerce: function (v) {
                    return v + 1;
                }
            },

            syncProp: {
                default: 80
            },
            twoWayProp: {
                default: 70,
                twoWay: true
            },
            comprop10: {
                type: [Boolean, Function, Object, Array, Car],
                coerce: function (v) {
                    return v + 1;
                },
                default: function () {
                    return 50
                }
            },
        };

        this.$props = {
            comaa: { 'v-bind:comaaprop.sync': 'twoWayProp' }
        };
    }

    customMethod () {

    }
}