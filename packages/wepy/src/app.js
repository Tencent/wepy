
let RequestMQ = {
    map: {},
    mq: [],
    running: [],
    MAX_REQUEST: 5,
    push (param) {
        param.t = +new Date();
        while ((this.mq.indexOf(param.t) > -1 || this.running.indexOf(param.t) > -1)) {
            param.t += Math.random() * 10 >> 0;
        }
        this.mq.push(param.t);
        this.map[param.t] = param;
    },
    next () {
        let me = this;

        if (this.mq.length === 0)
            return;

        if (this.running.length < this.MAX_REQUEST - 1) {
            let newone = this.mq.shift();
                let obj = this.map[newone];
                let oldComplete = obj.complete;
                obj.complete = (...args) => {
                    me.running.splice(me.running.indexOf(obj.t), 1);
                    delete me.map[obj.t]; 
                    oldComplete && oldComplete.apply(obj, args);
                    me.next();
                }
                this.running.push(obj.t);
                return wx.request_bak(obj);
        }
    },
    request (obj) {
        let me = this;
        
        obj = obj || {};
        obj = (typeof(obj) === 'string') ? {url: obj} : obj;
        
        
        this.push(obj);

        return this.next();
    }
};


export default class {

    init () {
        this.addPromise();
        this.hackRequest();
        this.$wxapp = getApp();
    }

    addPromise () {

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
            if (!noPromiseMethods[key] && key.substr(0, 2) !== 'on' && key !== 'request' && !(/\w+Sync$/.test(key))) {
                wx[key + '_bak'] = wx[key];
                Object.defineProperty(wx, key, {
                    get () {
                        return (obj) => {
                            obj = obj || {};
                            //obj = (typeof(obj) === 'string') ? {url: obj} : obj;
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
    }


    hackRequest () {
        
        wx['request_bak'] = wx['request'];
        Object.defineProperty(wx, 'request', {
            get () {
                return (obj) => {
                    obj = obj || {};
                    obj = (typeof(obj) === 'string') ? {url: obj} : obj;
                    return new Promise((resolve, reject) => {
                        obj.success = resolve;
                        obj.fail = (res) => {
                            if (res && res.errMsg) {
                                reject(new Error(res.errMsg));
                            } else {
                                reject(res);
                            }
                        }
                        RequestMQ.request(obj);
                    })
                };
            }
        });
    }


}