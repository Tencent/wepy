/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 *
 * @modifier fengxinming
 * 迁移来自https://github.com/fengxinming/wepy-compiler-stylus
 */

const path = require('path');
const stylus = require('stylus');
const flatten = require('lodash.flatten');

module.exports = function(content, config, file) {
    return new Promise(function(resolve, reject) {
        const opath = path.parse(file);
        config.paths = [opath.dir];
        config.filename = opath.base;

        const sets = {};
        const defines = {};
        const rawDefines = {};
        let includes = [];
        let imports = [];
        let v;

        Object.keys(config).forEach(k => {
            v = config[k];
            switch (k) {
                case 'define':
                    Object.assign(defines, v);
                    break;
                case 'rawDefine':
                    Object.assign(rawDefines, v);
                    break;
                case 'include':
                    includes.push(v);
                    break;
                case 'import':
                    imports.push(v);
                    break;
                case 'url':
                    let obj;
                    if (typeof v === 'string') {
                        obj = {};
                        obj[v] = stylus.url();
                        Object.assign(defines, obj);
                    } else {
                        obj = {};
                        obj[v.name] = stylus.url({
                            limit: v.limit != null ? v.limit : 30000,
                            paths: v.paths || []
                        });
                        Object.assign(defines, obj);
                    }
                    break;
                case 'includeCSS':
                    k = 'include css';
                default:
                    sets[k] = v;
            }
        });

        delete config.define;
        delete config.rawDefine;
        delete config.include;
        delete config['import'];
        delete config.url;
        delete config.includeCSS;

        const instance = stylus(content, config);

        includes = flatten(includes);
        imports = flatten(imports);

        Object.keys(sets).forEach(key => {
            instance.set(key, sets[key]);
        });
        Object.keys(defines).forEach(key => {
            instance.define(key, defines[key]);
        });
        Object.keys(rawDefines).forEach(key => {
            instance.define(key, rawDefines[key], true);
        });
        (includes || []).forEach(n => {
            instance.include(n);
        });
        (imports || []).forEach(n => {
            instance['import'](n);
        });

        imports = instance.deps();

        instance.render(function(err, css) {
            if (err) {
                reject(err);
            } else {
                if (config.supportObject) {
                    var result = {};
                    result.css = css;
                    result.context = file;
                    result.imports = imports;
                    resolve(result);
                } else {
                    resolve(css);
                }
            }
        });
    });
};
