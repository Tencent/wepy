import native from './native';

export default class {

    $addons = {};

    $interceptors = {};

    $pages = {};



    init (wepy) {
        this.initAPI(wepy);
        this.$wxapp = getApp();
    }


    use (addon, ...args) {
        if (typeof(addon) === 'string' && this[addon]) {
            this.$addons[addon] = 1;
            this[addon](args);
        } else {
            this.$addons[addon.name] = new addon(args);
        }
    }

    intercept (api, provider) {
        this.$interceptors[api] = provider;
    }

    promisify () {
    }

    requestfix () {
    }
    initAPI (wepy) {
        var self = this;
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
            createCanvasContext: true,
            hideKeyboard: true,
            stopPullDownRefresh: true
        };
        Object.keys(wx).forEach((key) => {
            if (!noPromiseMethods[key] && key.substr(0, 2) !== 'on' && !(/\w+Sync$/.test(key))) {
                Object.defineProperty(native, key, {
                    get () {
                        return (obj) => {
                            obj = obj || {};
                            if (self.$interceptors[key] && self.$interceptors[key].config) {
                                let rst = self.$interceptors[key].config.call(self, obj);
                                if (rst === false) {
                                    if (self.$addons.promisify) {
                                        return Promise.reject('aborted by interceptor');
                                    } else {
                                        obj.fail && obj.fail('aborted by interceptor');
                                        return;
                                    }
                                }
                                obj = rst;
                            }
                            if (key === 'request') {
                                obj = (typeof(obj) === 'string') ? {url: obj} : obj;
                            }
                            if (self.$addons.promisify) {
                                return new Promise((resolve, reject) => {
                                    let bak = {};
                                    ['fail', 'success', 'complete'].forEach((k) => {
                                        bak[k] = obj[k];
                                        obj[k] = (res) => {
                                            if (self.$interceptors[key] && self.$interceptors[key][k]) {
                                                res = self.$interceptors[key][k].call(self, res);
                                            }
                                            if (k === 'success')
                                                resolve(res)
                                            else if (k === 'fail')
                                                reject(res);
                                        };
                                    });
                                    if (self.$addons.requestfix && key === 'request') {
                                        RequestMQ.request(obj);
                                    } else
                                        wx[key](obj);
                                });
                            } else {
                                let bak = {};
                                ['fail', 'success', 'complete'].forEach((k) => {
                                    bak[k] = obj[k];
                                    obj[k] = (res) => {
                                        if (self.$interceptors[key] && self.$interceptors[key][k]) {
                                            res = self.$interceptors[key][k].call(self, res);
                                        }
                                        bak[k] && bak[k].call(self, res);
                                    };
                                });
                                if (self.$addons.requestfix && key === 'request') {
                                    RequestMQ.request(obj);
                                } else
                                    wx[key](obj);
                            }
                        };
                    }
                });
                wepy[key] = native[key];
            } else {
                Object.defineProperty(native, key, {
                    get () { return (...args) => wx[key].apply(wx, args) }
                });
                wepy[key] = native[key];
            }
        });
    }
}