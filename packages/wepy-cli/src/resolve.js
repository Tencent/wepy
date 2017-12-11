/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import path from 'path';
import util from './util';

export default {
    init (config) {
        this.modules = config.modules || ['node_modules'];
        this.alias = config.alias;

        if (typeof this.modules === 'string') {
            this.modules = [this.modules];
        }

        let cwd = process.cwd();

        this.modulePaths = this.modules.map(v => {
            if (path.isAbsolute(v)) {
                return v;
            } else {
                return path.join(cwd, v);
            }
        });
        this._cacheModules = {};
        this._cacheAlias = {};
    },

    walk (file) {
        if (this._cacheModules[file]) {
            return this._cacheModules[file];
        }

        let f = null, ext = path.extname(file), dir, modulePath, filename;
        for (let i = 0, l = this.modulePaths.length; i < l; i++) {
            modulePath = this.modulePaths[i];
            filename = path.join(modulePath, file);
            let tmp = filename;
            if (ext) {
                f = util.isFile(tmp);
            } else {
                f = util.isFile(filename + '.js');
            }
            if (!f && util.isDir(tmp)) {
                tmp = path.join(filename, 'index.js');
                f = util.isFile(tmp);
            }
            if (f) {
                filename = tmp;
                break;
            }
        }
        if (!f) {
            return null;
        }
        this._cacheModules[file] = {
            modulePath: modulePath,
            file: filename
        };
        return this._cacheModules[file];
    },

    getPkg (lib) {
        let pkg = null, dir = null;
        let o = this.walk(lib + path.sep + 'package.json');
        if (!o)
            return null;

        pkg = util.readFile(o.file);
        if (pkg) {
            try {
                pkg = JSON.parse(pkg);
            } catch (e) {
                pkg = null;
            }
        }
        if (!pkg)
            return null;
        return {
            pkg: pkg,
            modulePath: o.modulePath,
            dir: path.join(o.modulePath, lib)
        };
    },

    getMainFile (lib) {
        let o = this.getPkg(lib);
        if (!o) {
            return null;
        }
        let main = o.pkg.main || 'index.js';
        if (o.pkg.browser && typeof o.pkg.browser === 'string') {
            main = o.pkg.browser;
        }
        return {
            file: main,
            modulePath: o.modulePath,
            pkg: o.pkg,
            dir: o.dir
        };
    },

    resolveAlias (lib) {
        if (!this.alias)
            return lib;
        if (this._cacheAlias[lib]) {
            return this._cacheAlias[lib];
        }
        let rst = lib;

        for (let k in this.alias) {
            let alias = this.alias[k];
            if (k[k.length - 1] === '$') {
                k = k.substring(0, k.length - 1);
                if (k === lib) {
                    if (path.extname(alias) === '') { // this is directory
                        this._cacheAlias[lib] = path.join(alias, 'index.js');
                    } else {
                        this._cacheAlias[lib] = alias;
                    }
                }
            } else {
                if ((lib.indexOf(k) === 0 && lib === k) || (lib !== k && lib.indexOf(k + '/') === 0)) {
                    this._cacheAlias[lib] = path.resolve(lib.replace(k, alias));
                }
            }
        }
        if (!this._cacheAlias[lib]) {
            this._cacheAlias[lib] = lib;
        }
        return this._cacheAlias[lib];
    }   
}