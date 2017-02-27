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

    init ($wxpage, $root, $parent) {
        let self = this;

        this.$wxpage = $wxpage;
        if (this.$isComponent) {
            this.$root = $root || this.$root;
            this.$parent = $parent || this.$parent;
            this.$wxapp = this.$root.$parent.$wxapp;
        }

        if (this.props) {
            this.props = Props.build(this.props);
        }

        let k, defaultData = {};


        let props = this.props;
        let key, val, binded;

        if (this.$props) { // generate mapping Props
            for (key in this.$props) {
                for (binded in this.$props[key]) {
                    if (/\.sync$/.test(binded)) { // sync goes to mapping
                        if (!this.$mappingProps[this.$props[key][binded]])
                            this.$mappingProps[this.$props[key][binded]] = {};
                        this.$mappingProps[this.$props[key][binded]][key] = binded.substring(7, binded.length - 5);
                    }
                }
            }
        }

        if (props) {
            for (key in props) {
                val = undefined;
                if ($parent && $parent.$props && $parent.$props[this.$name]) {
                    val = $parent.$props[this.$name][key];
                    binded = $parent.$props[this.$name][`v-bind:${key}.once`] || $parent.$props[this.$name][`v-bind:${key}.sync`];
                    if (binded) {
                        val = $parent[binded];
                        if (props[key].twoWay) {
                            if (!this.$mappingProps[key])
                                this.$mappingProps[key] = {};
                            this.$mappingProps[key]['parent'] = binded;
                        }
                    }
                }
                if (!this.data[key]) {
                    val = Props.getValue(props, key, val);
                    this.data[key] = val;
                }
            }
        }

        for (k in this.data) {
            defaultData[`${this.$prefix}${k}`] = this.data[k];

            this[k] = util.$copy(this.data[k], true);
        }
        this.setData(defaultData);

        let coms = Object.getOwnPropertyNames(this.$com);
        if (coms.length) {
            coms.forEach((name) => {
                this.$com[name].init(this.getWxPage(), $root, this);
                this.$com[name].onLoad && this.$com[name].onLoad();
                this.$com[name].$apply();
            });
        }
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
        if (typeof(k) === 'string') {
            if (v) {
                let tmp = {};
                tmp[k] = v;
                k = tmp;
            } else {
                let tmp = {};
                tmp[k] = this.data[`${k}`];
                k = tmp;
            }
            return this.$wxpage.setData(k);
        }
        let t = null, reg = new RegExp('^' + this.$prefix.replace(/\$/g, '\\$'), 'ig');
        for (t in k) {
            let noPrefix = t.replace(reg, '');
            this.data[noPrefix] = util.$copy(k[t], true);
        }
        return this.$wxpage.setData(k);
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

        let fn = com.methods[method];

        if (typeof(fn) === 'function') {
            let $evt = new event('', this, 'invoke');
            return fn.apply(com, args.concat($evt));
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
                let fn = c.events ? c.events[evtName] : undefined;
                if (typeof(fn) === 'function') {
                    fn.apply(c, args.concat($evt));
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
        while(com && com.$isComponent !== undefined && $evt.active) {
            let fn = com.events ? com.events[evtName] : undefined;
            if (typeof(fn) === 'function') {
                fn.apply(com, args.concat($evt));
            }
            com = com.$parent;
        }
    }

    $apply (fn) {
        if (typeof(fn) === 'function') {
            fn.call(this);
            this.$apply();
        } else {
            if (this.$$phase) {
                this.$$phase = '$apply';
            } else {
                this.$digest();
            }
        }
    }

    $digest () {
        let k;
        let originData = this.data;
        this.$$phase = '$digest';
        while (this.$$phase) {
            let readyToSet = {};
            for (k in originData) {
                if (!util.$isEqual(this[k], originData[k])) {
                    readyToSet[this.$prefix + k] = this[k];
                    originData[k] = util.$copy(this[k], true);
                    if (this.$mappingProps[k]) {
                        Object.keys(this.$mappingProps[k]).forEach((changed) => {
                            let mapping = this.$mappingProps[k][changed];
                            if (changed === 'parent' && !util.$isEqual(this.$parent[mapping], this[k])) {
                                this.$parent[mapping] = this[k];
                                this.$parent.$apply();
                            } else if (changed !== 'parent' && !util.$isEqual(this.$com[changed][mapping], this[k])) {
                                this.$com[changed][mapping] = this[k];
                                this.$com[changed].$apply();
                            }
                        });
                    }
                }
            }
            if (Object.keys(readyToSet).length)
                this.setData(readyToSet);
            this.$$phase = false;
        }
    }

}
