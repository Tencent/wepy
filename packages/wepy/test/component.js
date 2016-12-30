var assert = require('assert');
var wepy = require('../lib/wepy.js').default;
var wxfake = require('./wxfake');

var ComA = require('./fake/com_a');

var ComAA = require('./fake/com_a_a');

var Index = require('./fake/page');


describe('component.js', () => {
    

    let index = new Index();

    let com = new ComA();
    com.init(wxfake.getWxPage(), index, index);


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

    it('init', () => {
        assert.strictEqual(com.getCurrentPages(), 'wxpage', 'get current pages');
    });

    it('add mixin', () => {

        com.mixins = ComAA;
        com.initMixins();

        assert.strictEqual(com.$mixins[0] instanceof ComAA, true, 'added a mixin for component');
    });

    it('setData', () => {
        assert.deepEqual(com.setData('a', 1), {a:1}, 'set data with two string params');
        assert.deepEqual(com.setData({'a': 1}), {a:1}, 'set data with a object');
        assert.deepEqual(com.setData('a'), {a:1}, 'set data with one string params');
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

    it('$emit', () => {
        let page = new Index();
        page.events = {
            'test-emit': function (evt, a, b, c) {
                assert.strictEqual(evt.name, 'test-emit', 'test emit function');
                assert.strictEqual(evt.type, 'emit', 'test emit event type');
                assert.strictEqual(evt.source, com, 'test emit event source');
                assert.strictEqual(a + b + c, 1 + 2 + 3, 'test emit params');
            }
        }
        com.$parent = page;
        com.$emit('test-emit', 1, 2, 3);
    });

    it('$broadcast', () => {
        let childCom = new ComAA();
        let childchildCom = new ComAA();
        childCom.$com = {
            comaaa: childchildCom
        };
        childCom.events = {
            'test-broadcast': function (evt, a, b, c) {
                assert.strictEqual(evt.name, 'test-broadcast', 'test broadcast function');
                assert.strictEqual(evt.type, 'broadcast', 'test broadcast event type');
                assert.strictEqual(evt.source, com, 'test broadcast event source');
                assert.strictEqual(a + b + c, 1 + 2 + 3, 'test broadcast params');
            }
        }
        childchildCom.events = childCom.events;
        com.$com = {comaa: childCom, comab: childCom};
        com.$broadcast('test-broadcast', 1, 2, 3);
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
            assert.strictEqual(a + b + c, 1 + 2 + 3, 'test invoke params');
        };
        childCom.methods = {
            'method': function (evt, a, b, c) {
                console.log(arguments);
            }
        }
        childCom.events = {
            'test-invoke': function (evt, a, b, c) {
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

        com.$invoke('comaa', 'tap', 1, 2, 3);

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