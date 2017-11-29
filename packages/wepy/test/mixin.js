/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


var assert = require('assert');
var wepy = require('../lib/wepy.js').default;
var mixin = require('../lib/mixin.js').default;
var wxfake = require('./wxfake');
var Index = require('./fake/page');
var App = require('./fake/app');


describe('mixin.js', () => {


    let inst = new mixin();

    it('constructor', () => {
        try {
            let mix = mixin();
        } catch (e) {
            mix = null;
            assert.strictEqual(e instanceof TypeError, true, 'throw a TypeError');
        }
        assert.strictEqual(mix, null, 'mixin can not call as a function');
    });

    it('new', () => {
        assert.strictEqual(Object.keys(inst.data).length, 0, 'mixin default active');
    });

    it('add mixin property', () => {
        inst.data = {a: 1};
        inst.methods = {
            foo: function () {

            }
        }
        assert.strictEqual(inst.data.a, 1, 'mixin data');
    });

    it('$init', () => {
        let parent = {data: {b: 2, a: 2}};
        inst.data = {a: 1, c: 1};
        inst.$init(parent);

        assert.strictEqual(parent.data.a, 2, 'parent data covered if exsit in parent.');
        assert.strictEqual(parent.data.c, 1, 'mixin data copied if not exsit in parent.');
    });


    it('mixin function', () => {
        let appConfig = wepy.$createApp(App, true);
        let pageConfig = wepy.$createPage(Index, true);

        let page = pageConfig.$page;
        let app = appConfig.$app;

        pageConfig.onLoad.call(wxfake.getWxPage());


        assert.strictEqual(page.func1(), 'parent-func1', 'mixin customize function wont copy if parent function exsit.');
        assert.strictEqual(page.func2(), 'mixin-func2', 'mixin customize function will copy if parent function exsit.');

    });

});