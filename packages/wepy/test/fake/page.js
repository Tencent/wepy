/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

let assert = require('assert');

let wepy = require('../../lib/wepy.js').default;
let Mix = require('./mixin');
let ComA = require('./com_a');
let ComB = require('./com_b');
let ComC = require('./com_c');


let RepeatItem = require('./repeatItem');

module.exports = class Index extends wepy.page {
    constructor () {
        super(1, 2, 3);
        this.methods = {
            'tap': function (evt) {
                assert.strictEqual(evt.name, 'test_page_tap', 'page tap triggered');
            },
            'testFuncWatch': function (curVal, oldVal) {
                assert.strictEqual(curVal, 'new', 'data function watch change');
                assert.strictEqual(oldVal, 'old', 'data function watch change');
            }
        };
        this.components = {
            coma: ComA,
            comb: ComB,
            comc: ComC,
            repeatitem: RepeatItem
        };
        this.watch = {
            testWatch: function (curVal, oldVal) {
                assert.strictEqual(curVal, 'newVal', 'data watch change');
                assert.strictEqual(oldVal, 'oldVal', 'data watch change');
            },
            testFuncWatch: 'testFuncWatch'
        };
        this.data = {
            'testWatch': 'oldVal',
            'testFuncWatch': 'old',
            'a': 1,
            'objProp': {a:1},
            'c': 'string',
            'stringNumber': '123',
            'testValid': '50',
            myList: [{
                id: 1,
                name: '点击改变',
                list: [{
                    childid: '1.1',
                    childname: '子项，点我改变'
                }, {
                    childid: '1.2',
                    childname: '子项，点我改变'
                }, {
                    childid: '1.3',
                    childname: '子项，点我改变'
                }]
            }, {
                id: 2,
                name: '点击改变',
                list: [{
                    childid: '2.1',
                    childname: '子项，点我改变'
                }, {
                    childid: '2.2',
                    childname: '子项，点我改变'
                }, {
                    childid: '2.3',
                    childname: '子项，点我改变'
                }]
            }, {
                id: 3,
                name: '点击改变',
                list: [{
                    childid: '3.1',
                    childname: '子项，点我改变'
                }]
            }]
        };
        this.mixins = [Mix];

        this.$props = {
            coma: {
                'v-bind:comprop1.once': 'c',
                'comprop2': 'static props',
                'v-bind:comprop4.once': 'objProp',
                'v-bind:onceProp.once': 'testValid',
                'v-bind:syncProp.sync': 'testValid',
                'v-bind:twoWayProp.once': 'testValid',
                'v-bind:comprop3.once': 'stringNumber',
                'v-bind:comprop10.once': 'a'
            },
            'repeatitem': { 
                'v-bind:ritem.once': { 'for': 'myList', 'item': 'item', 'index': 'index', 'key': 'key', 'value': 'item' }, 
                'v-bind:rindex.once': { 'for': 'myList', 'item': 'item', 'index': 'index', 'key': 'key', 'value': 'index' }
            } 
        };

        this.$events = {
            coma: {
                'v-on:fn': 'customEvent'
            }
        };
    }

    onLoad () {
        assert.strictEqual(this.valueChangedAt, 'mixin onLoad', 'mixin\'s lifecycle executed before page\'s lifecycle')
    }

    onShow (args) {
        assert.strictEqual(this.valueChangedAt, 'mixin onShow', 'mixin\'s lifecycle executed before page\'s lifecycle')

        assert.strictEqual(this instanceof Index, true, 'page onShow triggered, this is self');
        assert.strictEqual(args.p, 1, 'page onShow triggered with params');
    }

    onRoute () {
        assert.strictEqual(this.valueChangedAt, 'mixin onRoute', 'mixin\'s lifecycle executed before page\'s lifecycle')
    }

    onShareAppMessage () {
        assert.notStrictEqual(this.valueChangedAt, 'mixin onShareAppMessage', 'ignore mixin\'s `onShareAppMessage` lifecyle')
    }

    custom (arg) {
        assert.strictEqual(this instanceof Index, true, 'page custom method triggered, this is self');
        assert.strictEqual(arg, 'user_custom', 'page custom method triggered with params');
    }


    func1 () {
        return 'parent-func1';
    }
}
