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

    it('isImmutable', () => {
        let a$ = Immutable.fromJS({ a: 1111 });
        let b = 'a string';

        assert.strictEqual(util.isImmutable(a$), true, 'is a immutable variable');

        assert.strictEqual(util.isImmutable(b), false, 'is not a immutable variable');
    })

});
