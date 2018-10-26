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
