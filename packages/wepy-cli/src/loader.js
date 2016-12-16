import Module from 'module';
import path from 'path';

import util from './util';


let relativeModules = {};
let requiredModules = {};

let loadedPlugins = [];


class PluginHelper {
    constructor (plugins, op) {
        this.applyPlugin(0, op);
        return true;
    }
    applyPlugin (index, op) {
        let plg = loadedPlugins[index];

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

export default {
    loadCompiler (lang) {
        if (['wxml', 'xml', 'css', 'js'].indexOf(lang) > -1) {
            return (c) => {
                return Promise.resolve(c);
            };
        }

        let name = 'wepy-compiler-' + lang;
        let compiler = this.load(name);

        if (!compiler) {
            this.missingNPM = name;
            util.log(`找不到编译器：${name}。`, 'warning');
        }

        return compiler;
    },

    getNodeModulePath(loc, relative) {
        relative = relative || util.currentDir;
        if (typeof Module === 'object') return null;

        let relativeMod = relativeModules[relative];

        if (!relativeMod) {
            relativeMod = new Module;

            let filename = path.join(relative, '.babelrc');
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
        } catch (e) {
            if (e.message !== 'missing path')
                console.log(e);
        }
        if (m) {
            m = m.default ? m.default : m;
            requiredModules[loc] = m;
        }
        return m;
    },

    loadPlugin(plugins, op) {
        let plg, plgkey, setting, config;
        for (plgkey in plugins) {
            let name = 'wepy-plugin-' + plgkey;
            setting = plugins[plgkey];
            plg = this.load(name);

            if (!plg) {
                this.missingNPM = name;
                util.log(`找不到插件：${name}。`, 'warning');
                return false;
            }
            loadedPlugins.push(new plg(setting));
        }
        return true;
    },
    PluginHelper: PluginHelper
}