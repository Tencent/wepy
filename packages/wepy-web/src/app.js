import native from './native';


export default class {

    $addons = {};

    $interceptors = {};

    $pages = {};



    init () {
        this.initAPI();
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
    }
}