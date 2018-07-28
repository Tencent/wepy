/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import Vue from 'vue';
import VueRouter from 'vue-router';
import event from './event';

import {camelize, hyphenate} from './helper/word';


const pageEvent = ['onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage'];

const addStyle = (stylelist) => {
    // fix style inject sort, https://github.com/Tencent/wepy/issues/1645
    stylelist = stylelist.reverse()
    
    let styleElement = document.createElement('style');
    let head = document.head || document.getElementsByTagName('head')[0];

    let css = '';
    stylelist.forEach(id => {
        css += __wepy_require(id) + '\r\n';
    });
    
    let cssNode = document.createTextNode(css);
    styleElement.appendChild(cssNode);
    head.appendChild(styleElement);
    styleElement.type = 'text/css';
    return styleElement;
};


const $createMixin = (com, mixinClass) => {
    let obj = {};
    let mixin = new mixinClass;
    for (let k in mixin) {
        if (k === 'data') {
            obj.data = function () {
                return mixin.data;
            }
        } else if (k === 'methods') {
            obj[k] = {};
            for (let method in mixin[k]) {
                obj[k][method] = mixin[k][method].bind(com);
            }
        } else {
            obj[k] = mixin[k];
        }
    }
    return obj;
};

const $createComponent = (com, template) => {

    let k, vueObject = {};

    vueObject.template = template;
    vueObject.data = function () {
        return com.data;
    };

    vueObject.components = {};
    vueObject.methods = {};

    Object.getOwnPropertyNames(com.components || {}).forEach((name) => {
        let cClass = com.components[name];
        let child = new cClass();
        //child.initMixins();
        child.$name = name;

        com.$com[name] = child;
        vueObject.components[name] = $createComponent(child, cClass.template);
    });

    Object.getOwnPropertyNames(com.methods || {}).forEach((method) => {
        let fn = com.methods[method];
        vueObject.methods[method] = function (...arg) {
            let e = arg[arg.length - 1];

            // Component event params are from $arguments
            if (!e) {
                e = this.$arguments[0];
            }
            let evt = new event('system', com, e.type);
            evt.$transfor(e);
            if (evt.type === 'input') {
                evt.detail = {};
                evt.detail.value = evt.srcElement.value;
            }
            arg[arg.length - 1] = evt;

            // this !== $vm in repeats.
            if (com.$vm !== this) {
                com.$vm = this;
                com.$index = this.$parent.$children.indexOf(this);
                if (this.$parent && this.$parent.$parent && this.$parent.$parent.$children) {
                    com.$parent.$index = this.$parent.$parent.$children.indexOf(this.$parent);
                }
            }
            fn.apply(com, arg);
        }
    });


    if (typeof com.mixins === 'object' && com.mixins.constructor === Array) {
        vueObject.mixins = com.mixins.map(mixin => {
            return $createMixin(com, mixin);
        });
    } else if (typeof com.mixins === 'function') {
        vueObject.mixins = [$createMixin(com, mixin)];
    }

    vueObject.props = com.props;
    vueObject.computed = com.computed;
    vueObject.watch = com.watch;
    vueObject.events = com.events;

    vueObject.created = function () {
        com.$wxpage = this;
        com.$vm = this;
        this.$wepy = com;

        if (!com.$isComponent) {
            wx._currentPage = com;
            wx._currentPage.__route__ = this.$route.path;
            wx._currentPage.__wxWebviewId__ = 0;

            let share = typeof com.onShareAppMessage === 'funciton' ? com.onShareAppMessage() : null;
            if (share) {
                wx.__initShare && wx.__initShare(share);
            } else {
                wx.__hideShare && wx.__hideShare();
            }
        }

        if (typeof com.onLoad === 'function') {
            com.onLoad.call(com, com.$vm.$route.query, {});
        }
    };

    vueObject.ready = function () {
        console.log(`${com.$name} is ready`);
        com.$wxpage = this;
        com.$vm = this;

        if (typeof com.onShow === 'function') {
            com.onShow.call(com);
        }
    };

    [].concat(Object.getOwnPropertyNames(com.props || {})).
        concat(Object.getOwnPropertyNames(com.computed || {})).
        concat(Object.getOwnPropertyNames(com.data || {})).
        forEach(v => {
            v = camelize(v);
            Object.defineProperty(com, v, { 
                get: function () {
                    return com.$vm[v];
                },
                set: function (val) {
                    com.$vm[v] = val;
                }
            });
        });
    return vueObject;
}

export default {
    $createApp (appClass, config) {
        let k, routes = [];

        let app = new appClass;

        this.platform = wx.__platform;
        app.$components = [];
        app.$apis = [];

        if (!this.$instance) {
            app.$init(this);
            this.$instance = app;
        }

        // Vue2
        /*for (k in config.routes) {
            routes.push({
                path: '/' + k,
                component: this.$createPage(__wepy_require(config.routes[k]).default)
            }, { path: '*', redirect: '/' + k })
        }
        const router = new VueRouter({ routes: routes });
        const vueApp = new Vue({
            router
        }).$mount('#app');*/


        addStyle(config.style);

        
        if (typeof app.onLaunch === 'function') {
            app.onLaunch();
        }
        if (typeof app.onShow === 'function') {
            console.warn('onShow is not implemented in web');
        }
        if (typeof app.onHide === 'function') {
            console.warn('onHide is not implemented in web');
        }

        // 注入组件
        for (k in config.components) {
            app.$components.push(k);
            let com = __wepy_require(config.components[k]).default;
            com.name = 'wepy-' + com.name;
            Vue.component('wepy-' + k, com);
        }
        
        // 注入API
        for (k in config.apis) {
            app.$apis.push(k);
            let apiMod = __wepy_require(config.apis[k]);
            if (apiMod.default) {
                Object.defineProperty(wx, k, {
                    get () {
                        return apiMod.getter(Vue.extend(apiMod.default));
                    }
                });
            } else {
                Object.defineProperty(wx, k, {
                    get () {
                        return apiMod.getter();
                    }
                });
            }
        }
        
        Vue.use(VueRouter);

        let router = new VueRouter();
        let index = '';

        for (k in config.routes) {
            let tmp = {};
            if (!index)
                index = k;
            tmp['/' + k] = {
                component: this.$createPage(__wepy_require(config.routes[k]).default, '/' + k)
            }
            router.map(tmp);
        }
        router.redirect({
            '*': '/' + index
        });
        router.start({}, '#app');

        router.beforeEach((trans) => {
            window.scrollTo(0, 0);
            trans.next();
        });

        window.$router = router;
    },
    $createPage (pageClass, pagePath) {

        let page = new pageClass();

        if (pagePath)
            this.$instance.$pages[pagePath] = page;

        page.$name = pageClass.name || 'unnamed';
        page.$app = this.$instance;

        let vueObject = $createComponent(page, pageClass.template);

        page.$init(Vue, this.$instance, this.$instance);

        wx._currentPages = wx._currentPages || [];
        wx._currentPages.push(page);
        page.__route__ = pagePath;
        page.__wxWebviewId__ = 0;
        
        return vueObject;
    },
}
