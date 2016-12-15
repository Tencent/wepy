import Module from 'module';
import path from 'path';

import util from './util';


let relativeModules = {};
let requiredModules = {};

export default {
    loadCompiler (lang) {
        if (['wxml', 'xml', 'css', 'js'].indexOf(lang) > -1) {
            return (c) => {
                return Promise.resolve(c);
            };
        }

        lang = 'wepy-compiler-' + lang;

        let compiler = this.load(lang);

        if (!compiler) {
            util.log('找不到编译器：' + 'wepy-compiler-' + lang, '错误');
        }

        return compiler;
    },

    getNodeModulePath(loc, relative) {
        relative = relative || util.currentDir;
        if (typeof Module === "object") return null;

        let relativeMod = relativeModules[relative];

        if (!relativeMod) {
            relativeMod = new Module;

            let filename = path.join(relative, ".babelrc");
            relativeMod.id = filename;
            relativeMod.filename = filename;

            relativeMod.paths = Module._nodeModulePaths(relative);
            relativeModules[relative] = relativeMod;
        }

        try {
            return Module._resolveFilename(loc, relativeMod);
        } catch (err) {
            return null;
        }
    },
    load(loc, relative) {

        if (requiredModules[loc])
            return requiredModules[loc];

        let modulePath = this.getNodeModulePath(loc, relative);
        let m = null;
        try {
            m = require(modulePath);
        } catch (e) {}
        if (m) {
            m = m.default ? m.default : m;
            requiredModules[loc] = m;
        }
        return m;
    },

    loadPlugin(plugins, op) {
        let plg, plgkey, setting, config;
        this.plugins = [];
        this.index = 0;
        for (plgkey in plugins) {
            setting = plugins[plgkey];
            plg = this.load(plgkey);

            if (!plg) {
                util.log('找不到插件：' + plgkey, '错误');
                return;
            }
            this.plugins.push(new plg(setting));
        }
        this.applyPlugin(0, op);
    },
    applyPlugin(index, op) {
        let plg = this.plugins[index];

        if (!plg) {
            op.done && op.done(op);
        } else {
            op.next = () => {
                this.applyPlugin(index + 1, op);
            };
            op.catch = () => {
                op.error && op.error(op);
            };
            if (plg)
                plg.apply(op);
        }
    }
}