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


wxfake.resetGlobal();


describe('base.js', () => {


    it('create app', () => {
        wxfake.resetGlobal();

        let config = wepy.$createApp(App, true);

        assert.strictEqual(typeof config.$app.custom, 'function', 'return a app instance');
    });

    it('create page', () => {
        let page = wepy.$createPage(Index, true);

        page.onLoad.call(wxfake.getWxPage());

        assert.strictEqual(typeof page.onShow, 'function', 'return a page object');

        //page.onLoad.call(wxfake.getWxPage(), {p: 1});


        page.onShow.call(wxfake.getWxPage(), {p: 1});

        let comEvt = new wepy.event('test_com_tap', page, 'test_case');
        comEvt.$transfor({
            currentTarget: {
                dataset: {
                    wpytapA: 'a',
                    wpytapB: 'b',
                    wpytapC: 'c'
                }
            }
        });
        page.$coma$tap(comEvt);

        page.tap(new wepy.event('test_page_tap', page, 'test_case'));


        let repeatEvt = new wepy.event('reapt_evt', page, 'test_case');
        repeatEvt.$transfor({
            currentTarget: {
                dataset: {
                    wpytapA: '1',
                    wpytapB: '2',
                    comIndex: '1'
                }
            }
        });

        page.$repeatitem$tap(repeatEvt);

        assert.strictEqual(page.$page.myList[1].id, 'changed by repeat item', 'parent list changed by repeat');


        let repeatInRepeatEvt = new wepy.event('repeat_in_repeat_evt', page, 'test_case');
        repeatInRepeatEvt.$transfor({
            currentTarget: {
                dataset: {
                    wpytapA: '100',
                    comIndex: '1-1'
                }
            }
        });
        page.$repeatitem$repeatinrepeat$tap(repeatInRepeatEvt);


        let repeatInRepeatEvt2 = new wepy.event('repeat_in_repeat_evt_again', page, 'test_case');
        repeatInRepeatEvt2.$transfor({
            currentTarget: {
                dataset: {
                    comIndex: '1-2'
                }
            }
        });
        page.$repeatitem$repeatinrepeat$tap2(repeatInRepeatEvt2);


        page.custom('user_custom');


        let index = page.$page;


        assert.strictEqual(index instanceof Index, true, 'return a page object');

        assert.strictEqual(index.$wxapp.app, global.getApp().app, '$wxapp reuturns getApp()');

        assert.strictEqual(index.getCurrentPages()[0]['__wxWebviewId__'], 0, 'getCurrentPages');


        assert.strictEqual(index.$com.coma.$wxapp.app, global.getApp().app, '$wxapp reuturns getApp()');

        assert.strictEqual(index.$com.coma.getCurrentPages()[0]['__wxWebviewId__'], 0, 'getCurrentPages');

    });
});