var assert = require('assert');
var util = require('../lib/util.js').default;
var cache = require('../lib/cache').default

cache.setConfig(require('../templates/template/wepy.config'))

describe('util.js', () => {
    describe('attrReplace', () => {
        it('bind data once or sync', () => {

            const capture = '<input :value="data1" :type.sync="data2"/>'
            const expect = '<input v-bind:value.once="data1" v-bind:type.sync="data2"/>'

            assert.strictEqual(util.attrReplace(capture), expect)
        });

        it('bind and catch events', () => {

            const capture = '<button @tap="tap" @tap.stop="tapstop" @childFn.user="parentFn">按钮</button>'
            const expect = '<button bindtap="tap" catchtap="tapstop" v-on:childFn="parentFn">按钮</button>'

            assert.strictEqual(util.attrReplace(capture), expect)
        });

        it('capture events', () => {

            const capture = '<view id="outer" @touchstart.capture="handleTap3" @touchstart.capture.stop="handleTap4">outer view</view>'
            const expect = '<view id="outer" capture-bind:touchstart="handleTap3" capture-catch:touchstart="handleTap4">outer view</view>'

            assert.strictEqual(util.attrReplace(capture), expect)
        });
    })
});
