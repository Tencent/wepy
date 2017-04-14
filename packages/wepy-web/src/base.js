import event from './event';

const PREFIX = '$';
const JOIN = '$';

let prefixList = {};
let comCount = 0;


const pageEvent = ['onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage'];


const addStyle = (css) => {
    let styleElement = document.createElement("style");
    let head = document.head || document.getElementsByTagName("head")[0];
    
    if (styleElement.styleSheet) {
        styleElement.styleSheet.cssText = replaceText(index, css);
    } else {
        let cssNode = document.createTextNode(css);
        styleElement.appendChild(cssNode);
    }
    head.appendChild(styleElement);
    styleElement.type = "text/css";
    return styleElement;
};


const $createMixin = (mixinClass) => {
    let obj = {};
    let mixin = new mixinClass;
    for (let k in mixin) {
        if (k === 'data') {
            obj.data = function () {
                return mixin.data;
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
        vueObject.methods[method] = (...arg) => {
            let e = arg[arg.length - 1];
            let evt = new event('system', com, e.type);
            evt.$transfor(e);
            arg[arg.length - 1] = evt;
            fn.apply(com, arg);
        }
    });


    if (typeof com.mixins === 'object' && com.mixins.constructor === Array) {
        vueObject.mixins = com.mixins.map(mixin => {
            return $createMixin(mixin);
        });
    } else if (typeof com.mixins === 'function') {
        vueObject.mixins = [$createMixin(mixin)];
    }

    vueObject.props = com.props;
    vueObject.computed = com.computed;
    vueObject.events = com.events;

    vueObject.created = function () {
        com.$wxpage = this;
        com.$vm = this;

        if (typeof com.onLoad === 'function') {
            com.onLoad.call(com);
        }
    };

    [].concat(Object.getOwnPropertyNames(com.props || {})).
        concat(Object.getOwnPropertyNames(com.computed || {})).
        concat(Object.getOwnPropertyNames(com.data || {})).
        forEach(v => {
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

        if (!this.$instance) {
            app.init(this);
            this.$instance = app;
        }

        for (k in config.routes) {
            routes.push({
                path: '/' + k,
                component: this.$createPage(__wepy_require(config.routes[k]).default)
            }, { path: '*', redirect: '/' + k })
        }

        addStyle(config.style);

        const router = new VueRouter({ routes: routes });
        const vueApp = new Vue({
            router
        }).$mount('#app');

    },
    $createPage (pageClass) {
        let page = new pageClass();
        page.init(Vue, this.$instance, this.$instance);

        return $createComponent(page, pageClass.template);

        /*
        let self = this;
        let config = {}, k;
        let page = new pageClass();
        if (pagePath)
            this.$instance.$pages[pagePath] = page;
        page.initMixins();
        config.$page = page;

        config.onLoad = function (...args) {

            page.$name = pageClass.name || 'unnamed';
            page.init(this, self.$instance, self.$instance);

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
            page.onLoad && page.onLoad.apply(page, args);

            page.$mixins.forEach((mix) => {
                mix['onLoad'] && mix['onLoad'].apply(page, args);
            });

            page.$apply();
        };

        config.onShow = function (...args) {

            self.$instance.__prevPage__ = page;

            page.onShow && page.onShow.apply(page, args);

            page.$mixins.forEach((mix) => {
                mix['onShow'] && mix['onShow'].apply(page, args);
            });

            let pages = getCurrentPages();
            let pageId = pages[pages.length - 1].__route__;

            if (self.$instance.__route__ !== pageId) {

                self.$instance.__route__ = pageId;

                page.onRoute && page.onRoute.apply(page, args);

                page.$mixins.forEach((mix) => {
                    mix['onRoute'] && mix['onRoute'].apply(page, args);
                });
            }

            page.$apply();
        };

        pageEvent.forEach((v) => {
            if (v !== 'onLoad' && v !== 'onShow') {
                config[v] = (...args) => {
                    let rst;
                    page[v] && (rst = page[v].apply(page, args));

                    if (v === 'onShareAppMessage')
                        return rst;

                    page.$mixins.forEach((mix) => {
                        mix[v] && mix[v].apply(page, args);
                    });

                    page.$apply();

                    return rst;
                };
            }
        });

        if (!page.onShareAppMessage) {
            delete config.onShareAppMessage;
        }

        return $bindEvt(config, page, '');*/
    },
}
