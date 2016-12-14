var assert = require('assert');
var wepy = require('../lib/wepy.js').default;
var wxfake = require('./wxfake');


var App = require('./fake/app');
var Index = require('./fake/page');


describe('base.js', () => {


    it('create app', () => {
        wxfake.resetGlobal();

        let config = wepy.$createApp(App);

        assert.strictEqual(typeof config.custom, 'function', 'return a app object');
    });

    it('create page', () => {
        let page = wepy.$createPage(Index);

        assert.strictEqual(typeof page.onShow, 'function', 'return a page object');

        page.onLoad.call(wxfake.getWxPage(), {p: 1});


        page.onShow.call(wxfake.getWxPage(), {p: 1});

        let event = new wepy.event('test_com_tap', page, 'test_case');
        event.$transfor({
            currentTarget: {
                dataset: {
                    wepyParams: 'a-b-c'
                }
            }
        });
        page.$coma$tap(event, 1, 2);

        page.tap(new wepy.event('test_page_tap', page, 'test_case'));

        page.custom('user_custom');

        //console.log(page);

    });
});