/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import event from './event';
import util from './util';


const Props = {
    check (t, val) {
        switch (t) {
            case String:
                return typeof(val) === 'string';
            case Number:
                return typeof(val) === 'number';
            case Boolean:
                return typeof(val) === 'boolean';
            case Function:
                return typeof(val) === 'function';
            case Object:
                return typeof(val) === 'object';
            case Array:
                return toString.call(val) === '[object Array]';
            default:
                return val instanceof t;
        }
    },
    build (props) {
        let rst = {};
        if (typeof(props) === 'string') {
            rst[props] = {};
        } else if (toString.call(props) === '[object Array]') {
            props.forEach((p) => {
                rst[p] = {};
            });
        } else {
            Object.keys(props).forEach(p => {
                if (typeof(props[p]) === 'function') {
                    rst[p] = {
                        type: [props[p]]
                    }
                } else if (toString.call(props[p]) === '[object Array]') {
                    rst[p] = {
                        type: props[p]
                    }
                } else
                    rst[p] = props[p];

                if (rst[p].type && toString.call(rst[p].type) !== '[object Array]')
                    rst[p].type = [rst[p].type];
            });
        }
        return rst;
    },
    valid (props, key, val) {
        let valid = false;
        if (props[key]) {
            if (!props[key].type) {
                valid = true;
            } else {
                return props[key].type.some(t => this.check(t, val));
            }
        }
        return valid;
    },
    getValue (props, key, value) {
        var rst;
        if (value !== undefined && this.valid(props, key, value)) {
            rst = value;
        } else if (typeof(props[key].default) === 'function') {
            rst = props[key].default();
        } else
            rst = props[key].default;
        return props[key].coerce ? props[key].coerce(rst) : rst;
    }
};

export default class {

    $com = {};
    $mixins = [];

    $isComponent = true;
    $prefix = '';

    $mappingProps = {};

    data = {};
    methods = {};

    $init ($wxpage, $root, $parent) {
        let self = this;


        this.$wxpage = $wxpage;
        if (this.$isComponent) {
            this.$root = $root || this.$root;
            this.$parent = $parent || this.$parent;
            this.$wxapp = this.$root.$parent.$wxapp;
            this.$app = this.$root.$app;
        }


        let coms = Object.getOwnPropertyNames(this.$com);
        if (coms.length) {
            coms.forEach((name) => {
                this.$com[name].$init($wxpage, $root, this);
            });
        }

        return;
    }

    initMixins () {
        if (this.mixins) {
            if (typeof(this.mixins) === 'function') {
                this.mixins = [this.mixins];
            }
        } else {
            this.mixins = [];
        }
        this.mixins.forEach((mix) => {
            let inst = new mix();
            inst.init(this);
            this.$mixins.push(inst);
        });
    }

    onLoad () {
    }

    setData (k, v) {
        if (typeof k === 'string') {
            this.$vm[k] = v;
        }
        for (let t in k) {
            this.$vm[t] = k[t];
        }
    }

    getWxPage () {
        return this.$wxpage;
    }

    getCurrentPages () {
        return this.$wxpage.getCurrentPages();
    }

    $getComponent(com) {
        if (typeof(com) === 'string') {
            if (com.indexOf('/') === -1) {
                return this.$com[com];
            } else if (com === '/') {
                return this.$parent;
            } else {
                let path = com.split('/');
                path.forEach((s, i) => {
                    if (i === 0) {
                        if (s === '') {   //   /a/b/c
                            com = this.$root;
                        } else if (s === '.') {
                            // ./a/b/c
                            com = this;
                        } else if (s === '..') {
                            // ../a/b/c
                            com = this.$parent;
                        } else {
                            com = this.$getComponent(s);
                        }
                    } else if (s) {
                        com = com.$com[s];
                    }
                });
            }
        }
        return (typeof(com) !== 'object') ? null : com;
    }

    $invoke (com, method, ...args) {
        com = this.$getComponent(com);

        if (!com) {
            throw new Error('Invalid path: ' + com);
        }

        let fn = com.methods ? com.methods[method] : '';

        if (typeof(fn) === 'function') {
            let $evt = new event('', this, 'invoke');
            let rst = fn.apply(com, args.concat($evt));
            com.$apply();
            return rst;
        } else {
            fn = com[method];
        }

        if (typeof(fn) === 'function') {
            return fn.apply(com, args);
        } else {
            throw new Error('Invalid method: ' + method);
        }
    }

    $broadcast (evtName, ...args) {
        let com = this;
        let $evt = typeof(evtName) === 'string' ? new event(evtName, this, 'broadcast') : $evt;
        let queue = [com];

        while(queue.length && $evt.active) {
            let current = queue.shift();
            for (let c in current.$com) {
                c = current.$com[c];
                queue.push(c);
                let fn = getEventsFn(c, evtName);
                if (fn) {
                    c.$apply(() => {
                        fn.apply(c, args.concat($evt));
                    });
                }
                if (!$evt.active)
                    break;
            }
        }
    }

    $emit (evtName, ...args) {
        let com = this;
        let source = this;
        let $evt = new event(evtName, source, 'emit');

        if (this.$parent === undefined)
            console.log(this);

        // User custom event;
        if (this.$parent.$events && this.$parent.$events[this.$name]) {
            let method = this.$parent.$events[this.$name]['v-on:' + evtName];
            if (method && this.$parent.methods) {
                let fn = this.$parent.methods[method];
                if (typeof(fn) === 'function') {
                    this.$parent.$apply(() => {
                        fn.apply(this.$parent, args.concat($evt));
                    });
                    return;
                } else {
                    throw new Error(`Invalid method from emit, component is ${this.$parent.$name}, method is ${method}. Make sure you defined it already.\n`);
                }
            }
        }
        while(com && com.$isComponent !== undefined && $evt.active) {
            // 保存 com 块级作用域组件实例
            let comContext = com;
            let fn = getEventsFn(comContext, evtName);
            fn && comContext.$apply(() => {
                fn.apply(comContext, args.concat($evt));
            });
            com = comContext.$parent;
        }
    }

    $apply (fn) {
        if (typeof(fn) === 'function') {
            fn.call(this);
            this.$apply();
        } else {
            return true;
            if (this.$$phase) {
                this.$$phase = '$apply';
            } else {
                this.$digest();
            }
        }
    }

    $digest () {
        let k;
        let originData = this.$data;
        this.$$phase = '$digest';
        while (this.$$phase) {
            let readyToSet = {};
            for (k in originData) {
                if (!util.$isEqual(this[k], originData[k])) { // compare if new data is equal to original data
                    readyToSet[this.$prefix + k] = this[k]; // send to ReadyToSet
                    this.data[k] = this[k];
                    originData[k] = util.$copy(this[k], true);
                    if (this.$mappingProps[k]) {
                        Object.keys(this.$mappingProps[k]).forEach((changed) => {
                            let mapping = this.$mappingProps[k][changed];
                            if (typeof(mapping) === 'object') {
                                this.$parent.$apply();
                            } else if (changed === 'parent' && !util.$isEqual(this.$parent.$data[mapping], this[k])) {
                                this.$parent[mapping] = this[k];
                                this.$parent.data[mapping] = this[k];
                                this.$parent.$apply();
                            } else if (changed !== 'parent' && !util.$isEqual(this.$com[changed].$data[mapping], this[k])) {
                                this.$com[changed][mapping] = this[k];
                                this.$com[changed].data[mapping] = this[k];
                                this.$com[changed].$apply();
                            }
                        });
                    }
                }
            }
            if (Object.keys(readyToSet).length) {
                if (this.computed) {
                    for (k in this.computed) { // If there are computed property, calculated every times
                        let fn = this.computed[k], val = fn.call(this);
                        if (!util.$isEqual(this[k], val)) { // Value changed, then send to ReadyToSet
                            readyToSet[this.$prefix + k] = val;
                            this[k] = util.$copy(val, true);
                        }
                    }
                }
                this.setData(readyToSet);
            }
            this.$$phase = (this.$$phase === '$apply') ? '$digest' : false;
        }
    }

}

function getEventsFn (comContext, evtName) {
    let fn = comContext.events ? comContext.events[evtName] : undefined;
    const typeFn = typeof(fn);
    let fnFn;
    if (typeFn === 'string') {
        // 如果 events[k] 是 string 类型 则认为是调用 methods 上方法
        const method = comContext.methods && comContext.methods[fn];
        if (typeof(method) === 'function') {
            fnFn = method;
        }
    } else if (typeFn === 'function') {
        fnFn = fn;
    }
    return fnFn;
}