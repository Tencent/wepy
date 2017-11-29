/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


var assert = require('assert');
var event = require('../lib/event.js').default;


describe('event.js', () => {

    it('new', () => {
        let inst = new event();
        assert.strictEqual(inst.active, true, 'event default active');
    });

    it('destroy', () => {
        let inst = new event();
        inst.$destroy();
        assert.strictEqual(inst.active, false, 'event destroy');
    });

    it('transfor', () => {
        let inst = new event();
        inst.$transfor({a:1});
        assert.strictEqual(inst.a, 1, 'event transfor');

    });

    it('constructor', () => {
        try {
            let inst = event();
        } catch (e) {
            inst = null;
            assert.strictEqual(e instanceof TypeError, true, 'throw a TypeError');
        }
        assert.strictEqual(inst, null, 'event can not call as a function');
    });
});