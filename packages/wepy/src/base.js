/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import event from './event';
import util from './util';

let PAGE_EVENT = ['onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage', 'onPageScroll', 'onTabItemTap'];
let APP_EVENT = ['onLaunch', 'onShow', 'onHide', 'onError'];


let $bindEvt = (config, com, prefix) => {
    com.$prefix = util.camelize(prefix || '');
    Object.getOwnPropertyNames(com.components || {}).forEach((name) => {
        let cClass = com.components[name];
        let child = new cClass();
        child.$initMixins();
        child.$name = name;
        let comPrefix = prefix ? (prefix + child.$name + '$') : ('$' + child.$name + '$');

        com.$com[name] = child;

        $bindEvt(config, child, comPrefix);
    });
    Object.getOwnPropertyNames(com.constructor.prototype || []).forEach((prop) => {
        if(prop !== 'constructor' && PAGE_EVENT.indexOf(prop) === -1) {
            config[prop] = function () {
                com.constructor.prototype[prop].apply(com, arguments);
                com.$apply();
            }
        }
    });

    let allMethods = Object.getOwnPropertyNames(com.methods || []);

    com.$mixins.forEach((mix) => {
        allMethods = allMethods.concat(Object.getOwnPropertyNames(mix.methods || []));
    });

    allMethods.forEach((method, i) => {
        config[com.$prefix + method] = function (e, ...args) {
            let evt = new event('system', this, e.type);
            evt.$transfor(e);
            let wepyParams = [], paramsLength = 0, tmp, p, comIndex;
            if (e.currentTarget && e.currentTarget.dataset) {
                tmp = e.currentTarget.dataset;
                while(tmp['wpy' + method.toLowerCase() + (p = String.fromCharCode(65 + paramsLength++))] !== undefined) {
                    wepyParams.push(tmp['wpy' + method.toLowerCase() + p]);
                }
                if (tmp.comIndex !== undefined) {
                    comIndex = tmp.comIndex;
                }
            }

            // Update repeat components data.
            if (comIndex !== undefined) {
                comIndex = ('' + comIndex).split('-');
                let level = comIndex.length, tmp = level;
                while(level-- > 0) {
                    tmp = level;
                    let tmpcom = com;
                    while (tmp-- > 0) {
                        tmpcom = tmpcom.$parent;
                    }
                    tmpcom.$setIndex(comIndex.shift());
                }
            }

            args = args.concat(wepyParams);
            let rst, mixRst;
            let comfn = com.methods[method];
            if (comfn) {
                rst = comfn.apply(com, args.concat(evt));
            }
            com.$mixins.forEach((mix) => {
                mix.methods[method] && (mixRst = mix.methods[method].apply(com, args.concat(evt)));
            });
            com.$apply();
            return comfn ? rst : mixRst;
        }
    });
    return config;
};


export default {
    $createApp (appClass, appConfig) {
        let config = {};
        let app = new appClass();

        if (!this.$instance) {
            app.$init(this, appConfig);
            this.$instance = app;
            this.$appConfig = appConfig;
        }

        // This is for test case
        if (arguments.length === 2 && arguments[1] === true) {
            config.$app = app;
        }

        app.$wxapp = getApp();

        APP_EVENT = APP_EVENT.concat(appConfig.appEvents || []);
        PAGE_EVENT = PAGE_EVENT.concat(appConfig.pageEvents || []);

        APP_EVENT.forEach((v) => {
            config[v] = (...args) => {
                let rst;
                !app.$wxapp && (app.$wxapp = getApp());
                app[v] && (rst = app[v].apply(app, args));
                return rst;
            };
        });
        return config;
    },
    $createPage (pageClass, pagePath) {
        let self = this;
        let config = {}, k;
        let page = new pageClass();
        if (typeof pagePath === 'string') {
            this.$instance.$pages['/' + pagePath] = page;
        }
        page.$initMixins();
        // This will be a circum Object
        if ((typeof pagePath === 'boolean' && pagePath) || (arguments.length === 3 && arguments[2] === true))
            config.$page = page;

        config.onLoad = function (...args) {

            page.$name = pageClass.name || 'unnamed';
            page.$init(this, self.$instance, self.$instance);

            let prevPage = self.$instance.__prevPage__;
            let secParams = {};
            secParams.from = prevPage ? prevPage : undefined;

            if (prevPage && Object.keys(prevPage.$preloadData).length > 0) {
                secParams.preload = prevPage.$preloadData;
                prevPage.$preloadData = {};
            }
            if (page.$prefetchData && Object.keys(page.$prefetchData).length > 0) {
                secParams.prefetch = page.$prefetchData;
                page.$prefetchData = {};
            }
            args.push(secParams);

            [].concat(page.$mixins, page).forEach((mix) => {
                mix['onLoad'] && mix['onLoad'].apply(page, args);
            });

            page.$apply();
        };

        config.onShow = function (...args) {

            self.$instance.__prevPage__ = page;

            [].concat(page.$mixins, page).forEach((mix) => {
                mix['onShow'] && mix['onShow'].apply(page, args);
            });

            let pages = getCurrentPages();
            let pageId = pages[pages.length - 1].__route__;
            let webViewId = pages[pages.length - 1].__wxWebviewId__;

            if (self.$instance.__wxWebviewId__ !== webViewId) { // if same page redirect, pageId will be the same, so changed to use webview Id

                page.$wxpage = this; // same page redirect, have to update the $wxpage, otherwise setData will goes to the old view

                self.$instance.__route__ = pageId;
                self.$instance.__wxWebviewId__ = webViewId;

                [].concat(page.$mixins, page).forEach((mix) => {
                    mix['onRoute'] && mix['onRoute'].apply(page, args);
                });
            }

            page.$apply();
        };

        PAGE_EVENT.forEach((v) => {
            if (v !== 'onLoad' && v !== 'onShow') {
                config[v] = (...args) => {
                    let rst;

                    if (v === 'onShareAppMessage') {
						page[v] && (rst = page[v].apply(page, args));
						return rst;
                    }

                    [].concat(page.$mixins, page).forEach((mix) => {
                        mix[v] && mix[v].apply(page, args);
                    });

                    if (v !== 'onPageScroll') {
                        console.log('invoke apply')
                        page.$apply();
                    }

                    return rst;
                };
            }
        });

        if (!page.onShareAppMessage) {
            delete config.onShareAppMessage;
        }

        if (!page.onPageScroll) {
            delete config.onPageScroll
        }

        return $bindEvt(config, page, '');
    },
}
