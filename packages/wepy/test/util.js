
var assert = require('assert');
var util = require('../lib/util.js').default;


describe('util.js', () => {

    it('$resolvePath', () => {

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', 'page2'), '/page/abc/efg/hij/page2', `resolvePath('/page/abc/efg/hij/klm', 'page2')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', '.'), '/page/abc/efg/hij/klm', `resolvePath('/page/abc/efg/hij/klm', '.')`);
        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', '..'), '/page/abc/efg/hij/klm', `resolvePath('/page/abc/efg/hij/klm', '..')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', 'a'), '/page/abc/efg/hij/a', `resolvePath('/page/abc/efg/hij/klm', 'a')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', '.page2'), '/page/abc/efg/hij/page2', `resolvePath('/page/abc/efg/hij/klm', '.page2')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', '.a'), '/page/abc/efg/hij/a', `resolvePath('/page/abc/efg/hij/klm', '.a')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', '..page2'), '/page/abc/efg/hij/page2', `resolvePath('/page/abc/efg/hij/klm', '..page2')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', '..aa'), '/page/abc/efg/hij/aa', `resolvePath('/page/abc/efg/hij/klm', '..aa')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', './page2'), '/page/abc/efg/hij/page2', `resolvePath('/page/abc/efg/hij/klm', './page2')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', '../page2'), '/page/abc/efg/page2', `resolvePath('/page/abc/efg/hij/klm', '../page2')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', '.../page2'), '/page/abc/efg/page2', `resolvePath('/page/abc/efg/hij/klm', '.../page2')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', '..../page2'), '/page/abc/efg/page2', `resolvePath('/page/abc/efg/hij/klm', '..../page2')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', './../page2'), '/page/abc/efg/page2', `resolvePath('/page/abc/efg/hij/klm', './../page2')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', './../../page2'), '/page/abc/page2', `resolvePath('/page/abc/efg/hij/klm', './../../page2')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', './../.../page2'), '/page/abc/page2', `resolvePath('/page/abc/efg/hij/klm', './../.../page2')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', './../../../page2'), '/page/page2', `resolvePath('/page/abc/efg/hij/klm', './../../../page2')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', './../../../../page2'), '/page2', `resolvePath('/page/abc/efg/hij/klm', './../../../../page2')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', './../../../../../page2'), '/page2', `resolvePath('/page/abc/efg/hij/klm', './../../../../page2')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', '/page2'), '/page2', `resolvePath('/page/abc/efg/hij/klm', '/page2')`);

        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', '//page2'), '/page2', `resolvePath('/page/abc/efg/hij/klm', '//page2')`);
        assert.strictEqual(util.$resolvePath('/page/abc/efg/hij/klm', '/./page2'), '/page2', `resolvePath('/page/abc/efg/hij/klm', '/./page2')`);

    });




    it('$getParams', () => {

        let p;

        p = util.$getParams('index?a=1&b=2');

        assert.strictEqual(Object.keys(p).length, 2, `$getParams('index?a=1&b=2')`);
        assert.strictEqual(p.a, '1');
        assert.strictEqual(p.b, '2');

        p = util.$getParams('index?a=1&b=2&c=' + encodeURIComponent('中国'));

        assert.strictEqual(Object.keys(p).length, 3, `$getParams('index?a=1&b=2')`);
        assert.strictEqual(p.a, '1');
        assert.strictEqual(p.b, '2');
        assert.strictEqual(p.c, '中国');

    });

});