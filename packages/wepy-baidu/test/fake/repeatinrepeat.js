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