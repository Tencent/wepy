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
var wxfake = require('./wxfake');

var App = require('./fake/app');
var Index = require('./fake/page');
var ComA = require('./fake/com_a');

var ComAA = require('./fake/com_a_a');

var Index = require('./fake/page');

var MixinA = require('./fake/mixin');

var wxfake = require('./wxfake');


describe('component.js', () => {


    wxfake.resetGlobal();

    let appConfig = wepy.$createApp(App, true);
    let pageConfig = wepy.$createPage(Index, true);
    pageConfig.onLoad.call(wxfake.getWxPage());



    let index = new Index();
    index.$init(wxfake.getWxPage(), wxfake.getWxPage());

    let com = new ComA();
    com.$init(wxfake.getWxPage(), index, index);


    com.prefix = '$coma';

    it('constructor', () => {
        try {
            let inst = ComA();
        } catch (e) {
            inst = null;
            assert.strictEqual(e instanceof TypeError, true, 'throw a TypeError');
        }
        assert.strictEqual(inst, null, 'Component can not call as a function');


    });

    it('new', () => {
        assert.strictEqual(com instanceof ComA, true, 'create a component instance');

        assert.strictEqual(com.$isComponent, true, 'component is not a component');

    });

    it('$init', () => {
        assert.strictEqual(com.getCurrentPages()[0].__route__, 'pages/page1', 'get current pages');
    });

    it('add mixin', () => {

        com.mixins = MixinA;
        com.$initMixins();

        assert.strictEqual(com.$mixins[0] instanceof MixinA, true, 'added a mixin for component');
    });

    it('setData', () => {
        assert.deepEqual(com.setData('a', 1), {a:1}, 'set data with two string params');
        assert.deepEqual(com.setData({'a': 1}), {a:1}, 'set data with a object');
        assert.deepEqual(com.setData('a'), {a:1}, 'set data with one string params');
    });


    it('watch', () => {
        index.testWatch = 'newVal';
        index.testFuncWatch = 'new';
        index.$apply();
    });

    it('$apply', () => {
        com.a = 2;
        com.$apply();

        assert.strictEqual(com.$$phase, false, 'normal apply');


        com.$apply(function () {
            com.a = 3;
        });
        assert.strictEqual(com.$$phase, false, 'function apply');

        com.$$phase = '$digest';
        com.$apply();
        assert.strictEqual(com.$$phase, '$apply', 'loop apply');

        com.$digest();
        assert.strictEqual(com.$$phase, false, 'digest');

    });

    it('$nextTick', function (done) {
        //this.timeout(1500);
        com.a = +new Date();
        com.$nextTick(function () {
            assert.strictEqual(this, com, 'setData callback use this');
            setTimeout(function () {
                assert.strictEqual(com.$$nextTick, null, '$$nextTick should be cleared');
                done();
            }, 100);
        });
        com.$apply();
    });

    it('$nextTick using promise', function (done) {
        //this.timeout(1500);
        com.a = +new Date();
        com.$nextTick().then(function () {
            setTimeout(function () {
                assert.strictEqual(com.$$nextTick, null, '$$nextTick should be cleared');
                done();
            }, 100);
        });
        com.$apply();
    });

    it('$nextTick callback for clear data', function (done) {
        //this.timeout(1500);
        com.a = +new Date();
        com.$apply();
        com.$nextTick(function () {
            assert.strictEqual(this, com, 'setData callback use this');
            setTimeout(function () {
                assert.strictEqual(com.$$nextTick, null, '$$nextTick should be cleared');
                done();
            }, 100);
        });
        com.$apply();
    });

    it('$nextTick using promise for clear data', function (done) {
        //this.timeout(1500);
        com.a = +new Date();
        com.$apply();
        com.$nextTick().then(function () {
            setTimeout(function () {
                assert.strictEqual(com.$$nextTick, null, '$$nextTick should be cleared');
                done();
            }, 100);
        });
        com.$apply();
    });


    it('$nextTick do apply', function (done) {
        //this.timeout(1500);
        com.a = +new Date();
        com.$nextTick(function () {
            assert.strictEqual(this, com, 'setData callback use this');
            com.a = +new Date();
            com.$apply();
            com.$nextTick(function () {
                assert.strictEqual(this, com, 'setData callback use this');
                com.a = +new Date();
                com.$apply();
                done();
            });
        });
        com.$apply();
    });

    it('computed test', () => {
        com.num = 11;
        com.$apply();

        assert.strictEqual(com.computedNum, 11 * 2, 'test computed');
    });

    it('$emit', () => {
        let page = new Index();
        page.methods.testEmitFn = function (a, b, c, evt) {
            assert.strictEqual(arguments.length, 4, 'test emit function arguments number');
            assert.strictEqual(evt.name, 'test-emit-string', 'test emit function');
            assert.strictEqual(evt.type, 'emit', 'test emit event type');
            assert.strictEqual(evt.source, com, 'test emit event source');
            assert.strictEqual(a + b + c, 1 + 2 + 3, 'test emit params');
        };
        page.events = {
            'test-emit': function (a, b, c, evt) {
                assert.strictEqual(arguments.length, 4, 'test emit function arguments number');
                assert.strictEqual(evt.name, 'test-emit', 'test emit function');
                assert.strictEqual(evt.type, 'emit', 'test emit event type');
                assert.strictEqual(evt.source, com, 'test emit event source');
                assert.strictEqual(a + b + c, 1 + 2 + 3, 'test emit params');
            },
            'test-emit-string': 'testEmitFn'
        }
        com.$parent = page;
        com.$emit('test-emit', 1, 2, 3);
        com.$emit('test-emit-string', 1, 2, 3);

        page = pageConfig.$page;

        try {
            page.$com.coma.$emit('fn', 'a', 'b');
            assert.strictEqual(false, true, 'emit an invalid method will always cause an error');
        } catch (e) {
        }

        page.methods.customEvent = function (a, b, evt) {
            assert.strictEqual(evt.type, 'emit', 'test emit event type');
            assert.strictEqual(a + b, 'ab', 'test emit params');

        };
        page.$com.coma.$emit('fn', 'a', 'b');

    });

    it('$broadcast', () => {
        let childCom = new ComAA();
        let childchildCom = new ComAA();
        childCom.$com = {
            comaaa: childchildCom
        };
        childCom.methods.testBroastFn = function (a, b, c, evt) {
            assert.strictEqual(arguments.length, 4, 'test broadcast function arguments number');
            assert.strictEqual(evt.name, 'test-broadcast-string', 'test broadcast function');
            assert.strictEqual(evt.type, 'broadcast', 'test broadcast event type');
            assert.strictEqual(evt.source, com, 'test broadcast event source');
            assert.strictEqual(a + b + c, 1 + 2 + 3, 'test broadcast params');
        };
        childCom.events = {
            'test-broadcast': function (a, b, c, evt) {
                assert.strictEqual(arguments.length, 4, 'test broadcast function arguments number');
                assert.strictEqual(evt.name, 'test-broadcast', 'test broadcast function');
                assert.strictEqual(evt.type, 'broadcast', 'test broadcast event type');
                assert.strictEqual(evt.source, com, 'test broadcast event source');
                assert.strictEqual(a + b + c, 1 + 2 + 3, 'test broadcast params');
            },
            'test-broadcast-string': 'testBroastFn'
        }
        childchildCom.events = childCom.events;
        com.$com = {comaa: childCom, comab: childCom};
        com.$broadcast('test-broadcast', 1, 2, 3);
        com.$broadcast('test-broadcast-string', 1, 2, 3);
    });

    it('$invoke', () => {
        let appConfig = wepy.$createApp(App, true);
        let pageConfig = wepy.$createPage(Index, true);

        let page = pageConfig.$page;
        let app = appConfig.$app;

        pageConfig.onLoad.call(wxfake.getWxPage());


        page.$invoke('./coma/comaa', 'testInvoke', 'arg1', 'arg2');
        page.$invoke('./coma/comaa', 'testCustomInvoke', 'arg1', 'arg2');
        page.$invoke('./Coma/Comaa', 'testInvoke', 'arg1', 'arg2');
        page.$invoke('./Coma/Comaa', 'testCustomInvoke', 'arg1', 'arg2');
        page.$invoke('./Coma/CoMaa', 'testCustomInvoke', 'arg1', 'arg2');
        page.$invoke('./ComA/CoMaa', 'testCustomInvoke', 'arg1', 'arg2');

    });

    it('$invoke', () => {
        let page = new Index();
        com.$parent = page;
        com.$root = page;
        page.$com = {coma: com, comb: com};
        page.customMethod = function (a, b, c) {
            assert.strictEqual(a + b + c, 1 + 2 + 3, 'test invoke parent');
        }
        let childCom = new ComAA();
        let childchildCom = new ComAA();
        childCom.$prefix = '$coma$comaa$'

        childCom.customMethod = function (a, b, c) {
            //console.log('customMethod');
            assert.strictEqual(a + b + c, 1 + 2 + 3, 'test invoke params');
        };
        childCom.methods = {
            'method': function (evt, a, b, c) {
                //console.log('invoke method');
                //console.log(arguments);
            }
        }
        childCom.events = {
            'test-invoke': function (evt, a, b, c) {
                //console.log('test-invoke');
                assert.strictEqual(evt.name, 'test-invoke', 'test invoke function');
                assert.strictEqual(evt.type, 'invoke', 'test invoke event type');
                assert.strictEqual(evt.source, com, 'test invoke event source');
                assert.strictEqual(a + b + c, 1 + 2 + 3, 'test invoke params');
            }
        }
        childchildCom.$prefix = '$coma$comaa$comaaa';
        childchildCom.events = childCom.events;
        com.$com = {comaa: childCom, comab: childCom};

        com.$invoke('comaa', 'customMethod', 1, 2, 3);

        //com.$invoke('comaa', 'tap', 1, 2, 3);

        com.$invoke('/', 'customMethod', 1, 2, 3);
        com.$invoke('/coma/comaa', 'customMethod', 1, 2, 3);
        com.$invoke('../comb', 'customMethod', 1, 2, 3);
        com.$invoke('./comaa', 'customMethod', 1, 2, 3);
        try {
            com.$invoke('comaa', 'undefinedFunc', 1, 2, 3);
        } catch (e) {
            assert.strictEqual(e.message.indexOf('Invalid method') > -1, true, 'test invoke undefined method');
        }

        try {
            com.$invoke('comx', 'undefinedFunc', 1, 2, 3);
        } catch (e) {
            assert.strictEqual(e.message.indexOf('Invalid path') > -1, true, 'test invoke undefined method');
        }

    });


});
