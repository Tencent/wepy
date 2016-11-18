export default class {

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
            if (!noPromiseMethods[key] && key.substr(0, 2) !== 'on' && !(/\w+Sync$/.test(key))) {
                wx[key + '_bak'] = wx[key];
                Object.defineProperty(wx, key, {
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
                                wx[key + '_bak'](obj);
                            });
                        };
                    }
                });
            }
        });

        this.$wxapp = getApp();
    }
}