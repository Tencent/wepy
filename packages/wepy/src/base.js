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

const pageEvent = ['onLoad', 'onReady', 'onShow', 'onHide', 'onUnload', 'onPullDownRefresh', 'onReachBottom'];


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
            let wepyParams = [], paramsLength = 0, tmp, p;
            if (e.currentTarget && e.currentTarget.dataset) {
                tmp = e.currentTarget.dataset;
                while(tmp['wepyParams' + (p = String.fromCharCode(65 + paramsLength++))] !== undefined) {
                    wepyParams.push(tmp['wepyParams' + p]);
                }
            }
            args = args.concat(wepyParams);
            let rst, mixRst;
            let comfn = com.methods[method];
            if (comfn) {
                rst = comfn.apply(com, args.concat(evt));
            }
            com.$mixins.forEach((mix) => {
                mix.methods[method] && (mixRst = mix.methods[method].apply(com, args));
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
            app.init();
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
    $createPage (pageClass) {
        let config = {}, k;
        let page = new pageClass();
        page.initMixins();
        let self = this;
        config.$page = page;

        config.onLoad = function (...args) {

            page.$name = pageClass.name || 'unnamed';
            page.init(this, self.$instance, self.$instance);

            page.onLoad && page.onLoad.apply(page, args);

            page.$mixins.forEach((mix) => {
                mix['onLoad'] && mix['onLoad'].apply(page, args);
            });

            page.$apply();
        }

        pageEvent.forEach((v) => {
            if (v !== 'onLoad') {
                config[v] = (...args) => {
                    let rst;
                    page[v] && (rst = page[v].apply(page, args));

                    page.$mixins.forEach((mix) => {
                        mix[v] && mix[v].apply(page, args);
                    });

                    page.$apply();
                    
                    return rst;
                };
            }
        });

        if (page.onShareAppMessage) {
            config.onShareAppMessage = (...args) => {
                return page.onShareAppMessage.apply(page, args);
            }
        }

        return $bindEvt(config, page, '');
    },
}
