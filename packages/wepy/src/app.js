/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import native from './native';

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
                return wx.request(obj);
        }
    },
    request (obj) {

        obj = obj || {};
        obj = (typeof(obj) === 'string') ? {url: obj} : obj;


        this.push(obj);

        return this.next();
    }
};


export default class {

    $addons = {};

    $interceptors = {};

    $pages = {};



    $init (wepy, config = {}) {
        this.$initAPI(wepy, config.noPromiseAPI);
        this.$initProvide();
        this.$wxapp = getApp();
    }

    $initProvide() {
        if (this.provide) {
            this.$provide = (typeof this.provide === 'function')
                ? this.provide.call(this)
                : this.provide;
        }
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

    $initAPI (wepy, noPromiseAPI) {
        const self = this;
        let noPromiseMethods = {
            // 媒体
            stopRecord: true,
            getRecorderManager: true,
            pauseVoice: true,
            stopVoice: true,
            pauseBackgroundAudio: true,
            stopBackgroundAudio: true,
            getBackgroundAudioManager: true,
            createAudioContext: true,
            createInnerAudioContext: true,
            createVideoContext: true,
            createCameraContext: true,

            // 位置
            createMapContext: true,

            // 设备
            canIUse: true,
            startAccelerometer: true,
            stopAccelerometer: true,
            startCompass: true,
            stopCompass: true,
            onBLECharacteristicValueChange: true,
            onBLEConnectionStateChange: true,

            // 界面
            hideToast: true,
            hideLoading: true,
            showNavigationBarLoading: true,
            hideNavigationBarLoading: true,
            navigateBack: true,
            createAnimation: true,
            pageScrollTo: true,
            createSelectorQuery: true,
            createCanvasContext: true,
            createContext: true,
            drawCanvas: true,
            hideKeyboard: true,
            stopPullDownRefresh: true,

            // 拓展接口
            arrayBufferToBase64: true,
            base64ToArrayBuffer: true
        };
        if (noPromiseAPI) {
            if (Array.isArray(noPromiseAPI)) {
                noPromiseAPI.forEach(v => noPromiseMethods[v] = true);
            } else {
                for (let k in noPromiseAPI) {
                    noPromiseMethods[k] = noPromiseAPI[k];
                }
            }
        }
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
                            if (typeof obj === 'string') {
                                return wx[key](obj);
                            }
                            if (self.$addons.promisify) {
                                let task;
                                const p = new Promise((resolve, reject) => {
                                    let bak = {};
                                    ['fail', 'success', 'complete'].forEach((k) => {
                                        bak[k] = obj[k];
                                        obj[k] = (res) => {
                                            if (self.$interceptors[key] && self.$interceptors[key][k]) {
                                                res = self.$interceptors[key][k].call(self, res);
                                            }
                                            if (k === 'success')
                                                resolve(res);
                                            else if (k === 'fail')
                                                reject(res);
                                        };
                                    });
                                    if (self.$addons.requestfix && key === 'request') {
                                        RequestMQ.request(obj);
                                    } else {
                                        task = wx[key](obj);
                                    }
                                });
                                if (key === 'uploadFile' || key === 'downloadFile') {
                                    p.progress = (cb) => {
                                        task.onProgressUpdate(cb);
                                        return p;
                                    };
                                    p.abort = (cb) => {
                                        cb && cb();
                                        task.abort();
                                        return p;
                                    }
                                }
                                return p;
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
                                } else {
                                    return wx[key](obj);
                                }
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
