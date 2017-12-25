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
import cache from './cache'

const DEFAULT_MODULES = ['node_modules'];
const DEFAULT_ALIASFIELDS = ['wepy', 'weapp', 'browser'];
const DEFAULT_MAINFIELDS = ['wepy', 'weapp', 'browser', 'module', 'main'];

export default {
    init (config) {
        this.alias = config.alias;
        this.modules = config.modules || DEFAULT_MODULES;
        this.aliasFields = config.aliasFields || DEFAULT_ALIASFIELDS;
        this.mainFields = config.mainFields || DEFAULT_MAINFIELDS;

        ['modules', 'aliasFields', 'mainFields'].forEach(opt => {
            typeof this[opt] === 'string' && (
                this[opt] = [].concat(this[opt])
            );
        });
  
        let pkgFile = util.getPkg();
        let pkg = JSON.parse(pkgFile);
        let cwd = util.currentDir;
        let ext = cache.getExt();
        
        // 优先级递减
        this.aliasFields.forEach(fields => {
            // 归类
            util.isObject(pkg[fields]) && Object.keys(pkg[fields] || {}).forEach(key => {
                // module形式的fieldsAlias归置于alias中，例： "xyz": "./src/xyz.js"，alias优先级较大
                if (key.indexOf('.') === -1) {
                    // => "xyz"、"xyz-xyz"
                    let value;
                    if (!pkg[fields][key]) {
                        value = 'false';
                    } else {
                        value = path.resolve(cwd, pkg[fields][key]);
                    }
                  
                    // fields中key或value路径后缀与配置缺省值相同时，replace后缀
                    if (path.extname(value) === ext)
                        value = value.replace(ext, '');
                  
                    this.alias = Object.assign({}, { [key]: value }, this.alias || {});
                } else if (!path.isAbsolute(key)) {
                    // relative path
                    let value = path.resolve(cwd, pkg[fields][key]);
                    key = path.resolve(cwd, key);
                  
                    // fields中key或value路径后缀与配置缺省值相同时，replace后缀
                    if (path.extname(key) === ext)
                        key = key.replace(ext, '');
                  
                    if (path.extname(value) === ext)
                        value = value.replace(ext, '');
                  
                    this.fieldsAlias = Object.assign({}, { [key]: value }, this.fieldsAlias || {});
                }
            });
        });

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

        // make sure fields is used in this package.
        pkg._activeFields = [];
        this.aliasFields.forEach(field => {
            if (pkg[field]) {
                pkg._activeFields.push(field);
            }
        });
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

        // 优先级递减
        let mainField, main
        for (let i = 0, l = this.mainFields.length; i < l; i++) {
            mainField = this.mainFields[i];
            if (o.pkg[mainField] && typeof o.pkg[mainField] === 'string') {
                main = o.pkg[mainField];
                break;
            }
        }

        main = main || 'index.js';

        return {
            file: main,
            modulePath: o.modulePath,
            pkg: o.pkg,
            dir: o.dir
        };
    },

    /*
    resolve package with contains different fields
     */
    resolveSelfFields (dir, pkg, lib) {
        for (let i = 0, l = pkg._activeFields.length; i < l; i++) {
            let field = pkg[pkg._activeFields[i]];
            if (field) {
                for (let k in field) {
                    // in Window, path may be dist\a\b, but in package.json it is ./dist/a/b, so can not just simply use ===
                    let matchPath = path.join(dir, k);
                    let requirePath = path.join(dir, lib);
                    if (matchPath === requirePath || matchPath === requirePath + path.extname(matchPath)) {
                        return field[k];
                    }
                }
            }
        }
        return null;
    },
  
    resolveFieldsAlias (lib) {
        return lib && this.fieldsAlias && this.fieldsAlias[lib]
            ? this.fieldsAlias[lib]
            : lib;
    },
  
    replaceFieldsAlias (currentAlias, opath) {
        let absolutePath;
        
        if (path.isAbsolute(currentAlias)) {
            absolutePath = currentAlias;
          
            currentAlias = this.resolveFieldsAlias(absolutePath) !== absolutePath
                ? this.resolveFieldsAlias(absolutePath)
                : currentAlias;
        } else if (currentAlias[0] === '.') {
            absolutePath = path.join(opath.dir, currentAlias);
            
            currentAlias = this.resolveFieldsAlias(absolutePath) !== absolutePath
                ? this.resolveFieldsAlias(absolutePath)
                : currentAlias;
        } else if (
            currentAlias.indexOf('/') === -1 || // require('asset');
            currentAlias.indexOf('/') === currentAlias.length - 1 || // require('a/b/something/')
            (currentAlias[0] === '@' && currentAlias.indexOf('/') !== -1 && currentAlias.lastIndexOf('/') === currentAlias.indexOf('/')) // require('@abc/something')
        ) {
            const mainFile = this.getMainFile(currentAlias);
            
            if (mainFile) {
                absolutePath = path.join(mainFile.dir, mainFile.file);
                currentAlias = this.resolveFieldsAlias(absolutePath) !== absolutePath
                    ? this.resolveFieldsAlias(absolutePath)
                    : currentAlias;
            }
        }
        return currentAlias;
    },

    resolveAlias (lib, opath) {
        if (!this.alias)
            return lib;
        if (this._cacheAlias[lib]) {
            return this._cacheAlias[lib];
        }
        let rst = lib;
        let ext = cache.getExt();

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
        // replace field alias
        this._cacheAlias[lib] = this.replaceFieldsAlias(this._cacheAlias[lib], opath);
        return this._cacheAlias[lib];
    }   
}