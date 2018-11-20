/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

var Immutable = require('immutable')
var assert = require('assert');
var wepy = require('../lib/wepy.js').default;


describe('index.js', () => {
    it('wepy.$isEmpty', () => {
        assert.strictEqual(wepy.$isEmpty({}), true, '{} is empty');
        assert.strictEqual(wepy.$isEmpty([]), true, '[] is empty');
    });


    it('wepy.$isDeepEqual', () => {
        let a = {a:{b:{c:{d:1}}}};
        let b = {a:{b:{c:{d:2}}}};
        let a$ = Immutable.fromJS(a);
        let a1$ = Immutable.fromJS(a);
        let a2$ = a$.setIn(['a', 'b', 'c', 'd'], 2222)

        assert.strictEqual(wepy.$isDeepEqual(a, b), false);

        assert.equal(wepy.$isDeepEqual(a, a$), true, 'compare with a immutable variable that has same values');

        assert.equal(wepy.$isDeepEqual(b, a$), false, 'compare with a immutable variable that has different values');

        assert.equal(wepy.$isDeepEqual(a$, a1$), true, 'compare two immutable variable that has same values');

        assert.equal(wepy.$isDeepEqual(a1$, a2$), false, 'compare two immutable variable that has different values');

        let c = {a:{b:[1,2,3,{e:[12,3,{a:'1'}]}]}};
        let d = {a:{b:[1,2,3,{e:[12,3,{a:'1'}]}]}};
        assert.strictEqual(wepy.$isDeepEqual(c, d), true);


        a = {a:{b:[1,2,3,{e:[12,3,{a:'1'}]}]}};
        b = {a:{b:[1,2,3,{e:[12,3,{a:'1'}]}]}};
        assert.strictEqual(wepy.$isDeepEqual(a, b), true);


        assert.strictEqual(wepy.$isDeepEqual(new String('123'), '123'), true, 'compare new String');

        assert.strictEqual(wepy.$isDeepEqual(new Number('123'), 123), true, 'compare new Number');

        assert.strictEqual(wepy.$isDeepEqual(/^a/, new RegExp('^a')), true, 'compare reg express');

        assert.strictEqual(wepy.$isDeepEqual(true, true), true, 'compare Boolean');

        assert.strictEqual(wepy.$isDeepEqual(NaN, NaN), true, 'compare NaN');

        assert.strictEqual(wepy.$isDeepEqual(0, 0), true, 'compare 0');

        let date = new Date();
        let cdate = new Date(+date);

        assert.strictEqual(wepy.$isDeepEqual(date, cdate), true, 'compare Date');


        assert.strictEqual(wepy.$isDeepEqual(Symbol('123'), Symbol('123')), false, 'compare Symbol');

        assert.strictEqual(wepy.$isDeepEqual(void 0, void 0), true, 'compare undefined');

        assert.strictEqual(wepy.$isDeepEqual(function () {return this}, function () {return this}), false, 'compare function');

        assert.strictEqual(wepy.$isDeepEqual(new function () {return this}, new function () {return this}), false, 'compare new instance');
    });
    it('wepy.$isEqual', () => {
        let a = {a:{b:[1,2,3,{e:[12,3,{a:'1'}]}]}};
        let b = {a:{b:[1,2,3,{e:[12,3,{a:'1'}]}]}};
        let a$ = Immutable.fromJS(a);
        let a1$ = Immutable.fromJS(a);
        let a2$ = a$.setIn(['a', 'b', 0], 2);

        assert.equal(wepy.$isEqual(a, b), true, 'wepy.$isEqual({a:{b:[1,2,3,{e:[12,3,{a:\'1\'}]}]}}, {a:{b:[1,2,3,{e:[12,3,{a:\'1\'}]}]}})');


        assert.equal(wepy.$isEqual(null, undefined), false, 'wepy.$isEqual(null, undeifned)');

        assert.equal(wepy.$isEqual(0, false), false, 'wepy.$isEqual(0, false)');

        assert.equal(wepy.$isEqual(0, 0), true, 'compare 0');

        assert.equal(wepy.$isEqual(NaN, NaN), true, 'compare NaN');


        assert.equal(wepy.$isEqual(undefined, 0), false, 'compare undefined');

        assert.equal(wepy.$isEqual([1], 1), false, 'wepy.$isEqual([1], 1)');

        assert.equal(wepy.$isEqual('a', 'a'), true, 'wepy.$isEqual(\'a\', \'a\')');

        assert.equal(wepy.$isEqual(a, a$), false, 'compare with a immutable variable that has same values');

        assert.equal(wepy.$isEqual(a$, a1$), true, 'compare two immutable variable that has same values');

        assert.equal(wepy.$isEqual(a$, a2$), false, 'compare two immutable variable that has different values');

    });
    it('wepy.$has', () => {
        let a = {a: 1};
        let b = 'a';
        assert.strictEqual(wepy.$has(a, b), true, 'wepy.$has({a:1},a)');

        a = {a:{b:2}};
        b = 'b';
        assert.strictEqual(wepy.$has(a, b), false, 'wepy.$has({a:{b:2}},b)');


        assert.strictEqual(wepy.$has({a: {b: 'foo'}}, ['a', 'b']), true, 'can check for nested properties.');
        assert.strictEqual(wepy.$has({a: {b: 'foo'}}, ['a', 'c']), false, 'can check for nested properties.');
    });
    // extends
    it('wepy.$extend', () => {
        let result;

        assert.strictEqual(wepy.$extend({a: 'b'}).a, 'b', 'only 1 arguments');

        assert.strictEqual(wepy.$extend(1, {a: 'b'}).a, 'b', 'target is not a object');
        assert.strictEqual(wepy.$extend({}, {a: 'b'}).a, 'b', 'can extend an object with the attributes of another');
        assert.strictEqual(wepy.$extend({a: 'x'}, {a: 'b'}).a, 'b', 'properties in source override destination');
        assert.strictEqual(wepy.$extend({x: 'x'}, {a: 'b'}).x, 'x', 'properties not in source don\'t get overridden');


        result = wepy.$extend({x: 'x'}, {a: 'a'}, {b: 'b'});
        assert.deepEqual(result, {x: 'x', a: 'a', b: 'b'}, 'can extend from multiple source objects');
        result = wepy.$extend({x: 'x'}, {a: 'a', x: 2}, {a: 'b'});
        assert.deepEqual(result, {x: 2, a: 'b'}, 'extending from multiple source objects last property trumps');
        result = wepy.$extend({}, {a: void 0, b: null});
        assert.deepEqual(Object.keys(result), ['a', 'b'], 'bring in undefined values');


        var F = function() {};
        F.prototype = {a: 'b'};
        var subObj = new F();
        subObj.c = 'd';
        assert.deepEqual(wepy.$extend({}, subObj), {a: 'b', c: 'd'}, 'extend copies all properties from source');
        wepy.$extend(subObj, {});
        assert.deepEqual(subObj.hasOwnProperty('a'), false, 'extend does not convert destination object\'s \'in\' properties to \'own\' properties');

        result = {};
        wepy.$extend(result, null, void 0, {a: 1});

        assert.strictEqual(result.a, 1, 'should not error on `null` or `undefined` sources');

        assert.deepEqual(wepy.$extend(null, {a: 1}), {a: 1}, 'extending null');
        assert.deepEqual(wepy.$extend(void 0, {a: 1}), {a: 1}, 'extending undefined');
    });



    // copy
    it('wepy.$copy', () => {
        let original, changed;


        assert.strictEqual(wepy.$copy(1), 1, 'copy a number');
        assert.strictEqual(wepy.$copy('a'), 'a', 'copy a string');
        assert.strictEqual(wepy.$copy(void 0), void 0, 'copy undefined');
        assert.strictEqual(wepy.$copy(null), null, 'copy null');
        assert.strictEqual(wepy.$copy(false), false, 'copy boolean');

        original = function () {};

        assert.strictEqual(wepy.$copy(original), original, 'copy funciton');
        assert.deepEqual(wepy.$copy([1,2,3]), [1, 2, 3], 'copy array');

        original = {a:{b:[1,2,{c:3}]}};
        changed = wepy.$copy(original);
        changed.a.b[2].c=4;
        assert.deepEqual(changed, original, 'copy object without deep');

        original = {a:{b:[1,2,{c:3}]}};
        changed = wepy.$copy(original, true);
        changed.a.b[2].c=4;

        assert.strictEqual(wepy.$isEqual(changed, original), false, 'copy object with deep');

        original = {a:{b:[1,2,{c:3}, {d: void 0}]}};
        changed = wepy.$copy(original, true);

        assert.strictEqual(wepy.$isEqual(changed, original), true, 'copy object with undefined with deep');


    });





})
