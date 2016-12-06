import event from './event';
import util from './util';

export default class {

    $com = {};
    $mixins = [];

    isComponent = true;
    prefix = '';


    init ($wxpage, $root, $parent) {
        let self = this;

        this.$wxpage = $wxpage;
        if (this.isComponent) {
            this.$root = $root || this.$root;
            this.$parent = $parent || this.$parent;
        }

        let k, defaultData = {};
        for (k in this.data) {
            defaultData[`${this.prefix}${k}`] = this.data[k];

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
            if (typeof(this.mixins) === 'funciton') {
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
        console.log('component ' + this.name + ' onload');
    }

    setData (k, v) {
        if (typeof(k) === 'string') {
            if (v) {
                let tmp = {};
                tmp[k] = v;
                k = tmp;
            } else {
                k = this.data[`${this.prefix}${k}`];
            }
            return this.$wxpage.setData(k);
        }
        let t = null, reg = new RegExp('^' + this.prefix.replace(/\$/g, '\\$'), 'ig');
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
        return this.$wxpage.getCurrentPages;
    }

    $getComponent(com) {
        if (typeof(com) === 'string') {
            if (com.indexOf('/') === -1) {
                return this.$com[com];
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
        return com;
    }

    $invoke (com, method, ...args) {
        com = this.$getComponent(com);

        if (!com) {
            throw 'Invalid path: ' + com;
        }

        let fn = this.$wxpage[com.prefix + method];

        if (typeof(fn) === 'function') {
            let evt = new event('', this, 'invoke');
            return fn.apply(com, [evt].concat(args));
        } else {
            fn = com[method];
        }

        if (typeof(fn) === 'function') {
            return fn.apply(com, args);
        } else {
            throw 'Invalid method: ' + method;
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
                    fn.apply(c, [$evt].concat(args));
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
        while(com.isComponent !== undefined && $evt.active) {
            let fn = com.events ? com.events[evtName] : undefined;
            if (typeof(fn) === 'function') {
                fn.apply(com, [$evt].concat(args));
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
                    readyToSet[this.prefix + k] = this[k];
                    originData[k] = util.$copy(this[k], true);
                }
            }
            if (Object.keys(readyToSet).length)
                this.setData(readyToSet);
            this.$$phase = false;
        }
    }

}