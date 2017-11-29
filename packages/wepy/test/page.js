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
var native = require('../lib/native.js').default;
var wxfake = require('./wxfake');

wxfake.resetGlobal();

var Index = require('./fake/page');
var Page2 = require('./fake/page2');
var App = require('./fake/app');


let appConfig = wepy.$createApp(App, true);
wepy.$instance = appConfig.$app;

let pageConfig = wepy.$createPage(Index, 'pages/page1', true);
let page2Config = wepy.$createPage(Page2, 'pages/page2', true);
let page = pageConfig.$page;
let app = appConfig.$app;

pageConfig.onLoad.call(wxfake.getWxPage());
pageConfig.onShow.call(wxfake.getWxPage(), {p: 1});


describe('page.js', () => {

    it('constructor', () => {
        try {
            let inst = Index();
        } catch (e) {
            inst = null;
            assert.strictEqual(e instanceof TypeError, true, 'throw a TypeError');
        }
        assert.strictEqual(inst, null, 'Page can not call as a function');
    });

    it('private params', () => {
        assert.strictEqual(page.$parent.__route__, 'pages/page1', '__route__');
        assert.strictEqual(page.$parent.__prevPage__.$name, page.$name, '__prevPage__');
    });

    it('wx instance', () => {

        assert.strictEqual(page.$wxapp.app, 'app', 'wxapp equal getApp()');

        assert.strictEqual(page.getCurrentPages()[0]['__wxWebviewId__'], 0, 'getCurrentPages');

        // app created many times in test case, can not make a object compare here.
        assert.strictEqual(page.$parent.$wxapp.app, app.$wxapp.app, 'page\'s parent is page');

        assert.strictEqual(page.$root, page, 'page\'s parent is page');

        assert.strictEqual(page.$com.coma.$parent, page, 'component\'s parent is page');

        assert.strictEqual(page.$com.coma.$root, page, 'component\'s root is page');

        assert.strictEqual(page.$com.coma.$com.comaa.$parent, page.$com.coma, 'component\'s parent is parent component');

        assert.strictEqual(page.$com.coma.$com.comaa.$root, page, 'component\'s root is page');


    });

    it('new', () => {

        let page = new Index();

        assert.strictEqual(page instanceof Index, true, 'create a page instance');

        assert.strictEqual(page.$isComponent, false, 'page is not a component');

    });


    it('props', () => {
        let pageConfig = wepy.$createPage(Index, true);
        let page = pageConfig.$page;

        pageConfig.onLoad.call(wxfake.getWxPage());

        assert.strictEqual(page.$com.coma.comprop2, 'static props', 'static props checking');

        assert.strictEqual(page.$com.coma.comprop3, 123, 'coerce change string to int');

        assert.strictEqual(page.$com.coma.comprop4.a, 1, 'test object prop');

        assert.strictEqual(page.$com.coma.comprop5, 60, 'test prop static default value');

        assert.strictEqual(page.$com.coma.staticDefault, 'static', 'test prop static default value again');

        assert.strictEqual(page.$com.coma.funcProp, 'func', 'test prop function default value');

        assert.strictEqual(page.$com.coma.staticAndCoerce, 2, 'test prop default value with coerce');



        assert.strictEqual(page.$com.coma.onceProp, '50', 'test once prop validate');
        assert.strictEqual(page.$com.coma.syncProp, '50', 'test sync prop validate');
        assert.strictEqual(page.$com.coma.twoWayProp, '50', 'test two way prop validate');

        page.$com.coma.onceProp = 80;
        page.$com.coma.$apply();

        assert.strictEqual(page.testValid, '50', 'child prop.once changed will not change parent props');

        page.testValid = 90;
        page.$apply();


        assert.strictEqual(page.$com.coma.onceProp, 80, 'parent prop.once changed will not change child props');
        assert.strictEqual(page.$com.coma.twoWayProp, '50', 'parent prop.once changed will not change child props, even child prop is two way');


        assert.strictEqual(page.$com.coma.syncProp, 90, 'parent prop.sync changed will change child props');

        page.$com.coma.syncProp = 91;
        page.$com.coma.$apply();

        assert.strictEqual(page.testValid, 90, 'child prop changed will not change parent prop.sync');


        page.$com.coma.twoWayProp = 92;
        page.$com.coma.$apply();
        assert.strictEqual(page.testValid, 92, 'child two way prop changed will change parent prop even it is once prop');

        assert.strictEqual(page.$com.coma.syncProp, 92, 'sync prop changed, because parent prop changed');





        assert.strictEqual(page.$com.coma.$com.comaa.comaaprop, 92, 'prop goes to all children');

        page.$com.coma.$com.comaa.comaaprop = 100;
        page.$com.coma.$com.comaa.$apply();

        assert.strictEqual(page.$com.coma.twoWayProp, 100, 'parent prop changed will trigger child data changed');
        assert.strictEqual(page.testValid, 100, 'child prop changed will trigger parent data changed');

    });



    it('$preload', () => {

        
        wepy.$instance.__prevPage__ = page;

        let page2 = page2Config.$page;

        page.$preload('a', 1);

        page.$preload({b: 2, c: 3});

        assert.strictEqual(Object.keys(page.$preloadData).length, 3, 'page preload testing arguments length');
        assert.strictEqual(page.$preloadData.a, 1, 'page preload testing params 1');
        assert.strictEqual(page.$preloadData.b, 2, 'page preload testing params 2');
        assert.strictEqual(page.$preloadData.c, 3, 'page preload testing params 3');
        


        page2.onPrefetch = function (params, data) {
            assert.strictEqual(params.a, 1, 'page preload testing params 1');
            assert.strictEqual(params.b, 2, 'page preload testing params 1');
            assert.strictEqual(data.from, page, 'page preload data from');
            assert.strictEqual(data.preload.a, 1, 'page preload data 1');
            assert.strictEqual(data.preload.b, 2, 'page preload data 2');
            assert.strictEqual(data.preload.c, 3, 'page preload data 3');
        };

        page.$redirect('./page2', {a: 1, b: 2});

        page2Config.onLoad.call(wxfake.getWxPage(), {a: 1, b: 2});
        page2Config.onShow.call(wxfake.getWxPage());

        assert.strictEqual(Object.keys(page.$preloadData).length, 0, 'page preload data will be cleared after redirect');


        page2.$back();

        pageConfig.onShow.call(wxfake.getWxPage(), {p: 1});

        page.$preload({e: 2, f: 3});


        page2.onPrefetch = function (params, data) {
            assert.strictEqual(data.from, page, 'page preload data from');
            assert.strictEqual(data.preload.e, 2, 'page preload data 1');
            assert.strictEqual(data.preload.f, 3, 'page preload data 2');
        };


        page.$navigate({url: './page2?aa=1&bb=2'});

        page2Config.onLoad.call(wxfake.getWxPage(), {aa: 1, bb: 2});
        page2Config.onShow.call(wxfake.getWxPage());

        page2.$back(5);

        page.$switch('./page2');

    });



    it('onPrefetch', () => {
        wepy.$instance.__prevPage__ = page;

        let page2 = page2Config.$page;

        page2.onPrefetch = function () {
            return {time: 10};
        };

        page2.onLoad = function (params, data) {
            assert.strictEqual(params.a, 1, 'page onload testing params 1');
            assert.strictEqual(params.b, 2, 'page onload testing params 1');
            assert.strictEqual(data.from, page, 'page onload data from');
            assert.strictEqual(data.preload.e, 2, 'page onload data 1');
            assert.strictEqual(data.preload.f, 3, 'page onload data 2');
            assert.strictEqual(data.prefetch.time, 10, 'page prefetch data');
        };

        page.$preload({e: 2, f: 3});

        page.$redirect('./page2', {a: 1, b: 2});

        page2Config.onLoad.call(wxfake.getWxPage(), {a: 1, b: 2});
    });


    it('onReady', () => {
        page2Config.onReady.call(wxfake.getWxPage());
    });




});