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