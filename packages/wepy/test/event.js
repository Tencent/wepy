
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