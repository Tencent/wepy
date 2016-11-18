
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


let $bindEvt = (config, com, prefix) => {
    com.prefix = $getPrefix(prefix);
    Object.getOwnPropertyNames(com.components || {}).forEach((name) => {
        let cClass = com.components[name];
        let child = new cClass();
        child.name = name.toLowerCase();
        let comPrefix = prefix ? (prefix + child.name + '$') : ('$' + child.name + '$');

        //prefixList[comPrefix] = comCount++;
        $getPrefix(comPrefix);
        
        com.$com[name] = child;

        $bindEvt(config, child, comPrefix);
    });
    Object.getOwnPropertyNames(com.constructor.prototype || []).forEach((prop) => {
        if(prop !== 'constructor' && prop !== 'onLoad') {
            config[prop] = function () {
                com.constructor.prototype[prop].apply(com.$com[name], arguments);
                com.$apply();
            }
        }
    });
    Object.getOwnPropertyNames(com.methods || []).forEach((method, i) => {
        config[com.prefix + method] = function () {
            com.methods[method].apply(com, arguments);
            com.$apply();
        }
    });
    return config;
};



let RequestMQ = {
    map: {},
    mq: [],
    running: [],
    MAX_REQUEST: 5,
    push (param) {
        param.t = +new Date();
        while ((this.mq.indexOf(param.t) > 0 || this.running.indexOf(param.t) > 0)) {
            param.t = Math.random() * 10 >> 0;
        }
        this.map[param.t] = param;
    },
    quque () {
        setTimeout(() => {
            if (this.running < this.MAX_REQUEST) {
                this.next();
            } else {
                this.quque();
            }
        });
    },
    next () {
        let me = this;
        
        while(this.mq.length && this.running.length < this.MAX_REQUEST) {
            this.running.push(this.mq.shift());
        }
        if (this.running.length === 0)
            return null;
        //wx[key + '_bak'](this.map[this.running[0]]);

        let obj = this.map[this.running[0]];

        return new Promise((resolve, reject) => {
            obj.success = resolve;
            obj.fail = (res) => {
                if (res && res.errMsg) {
                    reject(new Error(res.errMsg));
                } else {
                    reject(res);
                }
            };
            obj.complete = () => {
                me.running.splice(me.running.indexOf(obj.t), 1);
                delete me.mq[obj.t];
                me.quque();
            }

            wx['request_bak'](this.map[this.running[0]]);
            
        });
    },
    request (obj) {
        let me = this;
        
        obj = obj || {};
        obj = (typeof(obj) === 'string') ? {url: obj} : obj;
        
        
        this.push(obj);

        return this.next();
    }
};

export default {
    init () {
        let noPromiseMethods = {
            stopRecord: true,
            pauseVoice: true,
            stopVoice: true,
            pauseBackgroundAudio: true,
            stopBackgroundAudio: true,
            showNavigationBarLoading: true,
            hideNavigationBarLoading: true,
            createAnimation: true,
            createContext: true,
            hideKeyboard: true,
            stopPullDownRefresh: true
        };
        Object.keys(wx).forEach((key) => {
            if (!noPromiseMethods[key] && key !== 'request' && key.substr(0, 2) !== 'on' && !(/\w+Sync$/.test(key))) {
                wx[key + '_bak'] = wx[key];
                Object.defineProperty(wx, key, {
                    get () {
                        return (obj) => {
                            obj = obj || {};
                            return new Promise((resolve, reject) => {
                                obj.success = resolve;
                                obj.fail = (res) => {
                                    if (res && res.errMsg) {
                                        reject(new Error(res.errMsg));
                                    } else {
                                        reject(res);
                                    }
                                }
                                wx[key + '_bak'](obj);
                            });
                        };
                    }
                });
            }
        });

        wx['request_bak'] = wx['request'];
        Object.defineProperty(wx, 'request', {
            get () {
                return (obj) => {
                    return RequestMQ.request(obj);
                    obj = obj || {};
                    return new Promise((resolve, reject) => {
                        obj.success = resolve;
                        obj.fail = (res) => {
                            if (res && res.errMsg) {
                                reject(new Error(res.errMsg));
                            } else {
                                reject(res);
                            }
                        }
                        wx[key + '_bak'](obj);
                    });
                };
            }
        });
    },
    $createApp (appClass) {
        let config = {};
        let app = new appClass();

        if (!this.instance) {
            app.init();
            this.instance = app;
        }
        Object.getOwnPropertyNames(app.constructor.prototype).forEach((name) => {
            if(name !== 'constructor')
                config[name] = app.constructor.prototype[name];
        });
        return config;
    },
    $createPage (pageClass) {
        let config = {}, k;
        let page = new pageClass();
        let self = this;

        config.onLoad = function () {

            page.name = pageClass.name;
            page.init(this, self.instance, self.instance);
            page.onLoad && page.onLoad();

            page.$apply();

            if (!page.$parent.$wxapp) {
                page.$parent.$wxapp = getApp();
            }
        }

        return $bindEvt(config, page, '');
    },
}