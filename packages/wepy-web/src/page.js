import native from './native';
import component from './component';
import util from './util';

export default class extends component {

    isComponent = false;


    $preloadData = {};

    $prefetchData = {};

    $init (wxpage, $parent) {

        this.$parent = $parent;
        this.$root = this;
        if (!$parent.$wxapp) {
            $parent.$wxapp = getApp();
        }
        this.$wxapp = $parent.$wxapp;
        super.$init(wxpage, this);
    }

    onLoad () {
        super.onLoad();
    }

    $preload(key, data) {
        if (typeof(key) === 'object') {
            let k;
            for (k in key) {
                this.$preload(k, key[k]);
            }
        } else {
            this.$preloadData[key] = data;
        }
    }

    $route(type, url, params = {}) {
        if (typeof(url) === 'string') {
            let s = url + '?';
            if (params) {
                let k;
                for (k in params) {
                    s += `${k}=${params[k]}&`
                }
            }
            s = s.substring(0, s.length - 1);
            url = {url: s};
        } else {
            params = util.$getParams(url.url);
        }
        let realPath = util.$resolvePath(this.$parent.__route__, url.url.split('?')[0]);
        let goTo = this.$parent.$pages[realPath];
        if (goTo && goTo.onPrefetch) {
            let prevPage = this.$parent.__prevPage__;
            let preloadData = {};
            if (prevPage && Object.keys(prevPage.$preloadData).length > 0) {
                preloadData = prevPage.$preloadData;
            }
            goTo.$prefetchData = goTo.onPrefetch(params, {from: this, preload: preloadData});
        }
        return native[type](url);
    }

    $redirect(url, params) {
        return this.$route('redirectTo', url, params);
    }

    $navigate(url, params) {
        return this.$route('navigateTo', url, params);
    }

    $switch(url) {
        if (typeof(url) === 'string')
            url = {url: url};

        return native.switchTab(url);
    }

    $back(delta) {
        let p = delta || {};
        if (typeof(p) === 'number')
            p = {delta: p};

        if (!p.delta)
            p.delta = 1;

        return native.navigateBack(p);
    }
}