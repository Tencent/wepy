import event from './event';

const PREFIX = '$';
const JOIN = '$';

let prefixList = {};
let comCount = 0;


let $getPrefix = (prefix) => {
    return prefix;
    /*if (!prefix)
        return '';
    if (prefixList[prefix])
        return prefixList[prefix];
    prefixList[prefix] = `${PREFIX}${(comCount++)}${JOIN}`;
    return prefixList[prefix];*/
}

const pageEvent = ['onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom', 'onShareAppMessage'];


let $bindEvt = (config, com, prefix) => {
    com.$prefix = $getPrefix(prefix);
    Object.getOwnPropertyNames(com.components || {}).forEach((name) => {
        let cClass = com.components[name];
        let child = new cClass();
        child.initMixins();
        child.$name = name;
        let comPrefix = prefix ? (prefix + child.$name + '$') : ('$' + child.$name + '$');

        $getPrefix(comPrefix);

        com.$com[name] = child;

        $bindEvt(config, child, comPrefix);
    });
    Object.getOwnPropertyNames(com.constructor.prototype || []).forEach((prop) => {
        if(prop !== 'constructor' && pageEvent.indexOf(prop) === -1) {
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
                while(tmp['wepyParams' + (p = String.fromCharCode(65 + paramsLength++))] !== undefined) {
                    wepyParams.push(tmp['wepyParams' + p]);
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
    $createApp (appClass) {
        let config = {};
        let app = new appClass();

        if (!this.$instance) {
            app.init(this);
            this.$instance = app;
        }
        Object.getOwnPropertyNames(app.constructor.prototype).forEach((name) => {
            if(name !== 'constructor')
                config[name] = app.constructor.prototype[name];
        });

        config.$app = app;
        app.$wxapp = getApp();
        return config;
    },
    $createPage (pageClass, pagePath) {
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

        return $bindEvt(config, page, '');
    },
}
