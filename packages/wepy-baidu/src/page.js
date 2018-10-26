/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

import native from './native';
import component from './component';
import util from './util';

export default class extends component {

    $isComponent = false;


    $preloadData = undefined;

    $prefetchData = undefined;

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

    onUnload() {
        super.onUnload();
    }

    $preload(key, data) {
        if (typeof(key) === 'object') {
            let k;
            for (k in key) {
                this.$preload(k, key[k]);
            }
        } else {
            (this.$preloadData ? this.$preloadData : (this.$preloadData = {}))[key] = data;
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
        // __route__ will be undefined if it called from onLoad
        if (!this.$parent.__route__) {
            this.$parent.__route__ = getCurrentPages()[0].__route__;
            this.$parent.__wxWebviewId__ = getCurrentPages()[0].__wxWebviewId__;
        }
        let absoluteRoute = this.$parent.__route__[0] !== '/' ? ('/' + this.$parent.__route__) : this.$parent.__route__;
        let realPath = util.$resolvePath(absoluteRoute, url.url.split('?')[0]);
        let goTo = this.$parent.$pages[realPath];
        if (goTo && goTo.onPrefetch) {
            let prevPage = this.$parent.__prevPage__;
            let preloadData = undefined;
            if (prevPage && prevPage.$preloadData) {
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
