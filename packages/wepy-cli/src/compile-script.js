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
import cache from './cache';
import cWpy from './compile-wpy';

import loader from './loader';

import resolve from './resolve';


const currentPath = util.currentDir;

let appPath, npmPath, src, dist;

export default {
    resolveDeps (code, type, opath) {
        let params = cache.getParams();
        let config = cache.getConfig();
        let wpyExt = params.wpyExt;


        return code.replace(/require\(['"]([\w\d_\-\.\/@]+)['"]\)/ig, (match, lib) => {
            let npmInfo = opath.npm;
            
            if (lib === './_wepylogs.js') {
                return match;
            }
            let resolved = lib;

            let target = '', source = '', ext = '', needCopy = false;

            if (config.output === 'ant' && lib === 'wepy') {
                lib = 'wepy-ant';
            }
            lib = resolve.resolveAlias(lib, opath);
            if (lib === 'false') {
                return `{}`
            } else if (path.isAbsolute(lib)) {
                source = lib;
                target = util.getDistPath(source);
            } else if (lib[0] === '.') { // require('./something'');
                let resolvedLib;
                if (npmInfo && npmInfo.pkg._activeFields.length) {
                    resolvedLib = resolve.resolveSelfFields(npmInfo.dir, npmInfo.pkg, path.join(path.relative(npmInfo.dir, opath.dir), lib));
                }
                if (resolvedLib) {
                    source = path.join(npmInfo.dir, resolvedLib);
                    lib = path.relative(opath.dir, source);
                    if (lib[0] !== '.') {
                        lib = './' + lib;
                    }
                } else {
                    source = path.join(opath.dir, lib);
                }
                if (type === 'npm') {
                    target = path.join(npmPath, path.relative(npmInfo.modulePath, source));
                    needCopy = true;
                } else {
                    // e:/dist/util
                    target = util.getDistPath(source);
                    needCopy = false;
                }
            } else if (lib.indexOf('/') === -1 || // require('asset');
                lib.indexOf('/') === lib.length - 1 || // reqiore('a/b/something/')
                (lib[0] === '@' && lib.indexOf('/') !== -1 && lib.lastIndexOf('/') === lib.indexOf('/')) // require('@abc/something')
            ) {  
                // require('stream') -> browsers: emitter->emitter-component;
                if (npmInfo && npmInfo.pkg._activeFields.length) {
                    let resolvedLib = resolve.resolveSelfFields(npmInfo.dir, npmInfo.pkg, lib);
                    lib = resolvedLib ? resolvedLib : lib;
                }

                let mainFile = resolve.getMainFile(lib);

                if (!mainFile) {
                    throw Error('找不到模块: ' + lib + '\n被依赖于: ' + path.join(opath.dir, opath.base) + '。\n请尝试手动执行 npm install ' + lib + ' 进行安装。');
                }
                npmInfo = {
                    lib: lib,
                    dir: mainFile.dir,
                    modulePath: mainFile.modulePath,
                    file: mainFile.file,
                    pkg: mainFile.pkg
                };

                let resolvedFile;
                if (mainFile.pkg && mainFile.pkg._activeFields.length) {
                    resolvedFile = resolve.resolveSelfFields(mainFile.dir, mainFile.pkg, mainFile.file);
                }
                resolvedFile = resolvedFile ? resolvedFile : mainFile.file;
                source = path.join(mainFile.dir, resolvedFile);
                target = path.join(npmPath, lib, resolvedFile);

                lib += path.sep + resolvedFile;
                ext = '';
                needCopy = true;
            } else { // require('babel-runtime/regenerator')
                let requieInfo = lib.split('/');
                let mainFile = resolve.getMainFile(requieInfo[0]);

                if (!mainFile) {
                    throw Error('找不到模块: ' + lib + '\n被依赖于: ' + path.join(opath.dir, opath.base) + '。\n请尝试手动执行 npm install ' + lib + ' 进行安装。');
                }
                npmInfo = {
                    lib: requieInfo[0],
                    dir: mainFile.dir,
                    modulePath: mainFile.modulePath,
                    file: mainFile.file,
                    pkg: mainFile.pkg
                };
                requieInfo.shift();

                source = path.join(mainFile.dir, requieInfo.join('/'));
                target = path.join(npmPath, npmInfo.lib, requieInfo.join('/'));
                ext = '';
                needCopy = true;
            }

            if (util.isFile(source + wpyExt)) {
                ext = '.js';
            } else if (util.isFile(source + '.js')) {
                ext = '.js';
            } else if (util.isFile(source + '.ts')) {
                ext = '.ts';
            } else if (util.isDir(source) && util.isFile(source + path.sep + 'index.js')) {
                ext = path.sep + 'index.js';
            }else if (util.isFile(source)) {
                ext = '';
            } else {
                throw ('找不到文件: ' + source);
            }
            source += ext;
            target += ext;
            lib += ext;
            resolved = lib;
            
            //typescript .ts file
            if (ext === '.ts') {
                target = target.replace(/\.ts$/, '') + '.js';
            }

            // 第三方组件
            if (/\.wpy$/.test(resolved)) {
                target = target.replace(/\.wpy$/, '') + '.js';
                resolved = resolved.replace(/\.wpy$/, '') + '.js';
                lib = resolved;
            }

            if (needCopy) {
                if (!cache.checkBuildCache(source)) {
                    cache.setBuildCache(source);
                    util.log('依赖: ' + path.relative(process.cwd(), target), '拷贝');
                    let newOpath = path.parse(source);
                    newOpath.npm = npmInfo;
                    this.compile('js', null, 'npm', newOpath);

                }
            }
            if (type === 'npm') {
                if (lib[0] !== '.') {
                    resolved = path.join('..' + path.sep, path.relative(opath.dir, npmInfo.modulePath), lib);
                } else {
                    if (lib[0] === '.' && lib[1] === '.')
                        resolved = './' + resolved;
                }

            } else {
                resolved = path.relative(util.getDistPath(opath, opath.ext, src, dist), target);
            }
            resolved = resolved.replace(/\\/g, '/').replace(/^\.\.\//, './');
            return `require('${resolved}')`;
        });
    },

    npmHack (opath, code) {
        // 一些库（redux等） 可能会依赖 process.env.NODE_ENV 进行逻辑判断
        // 这里在编译这一步直接做替换 否则报错
        code = code.replace(/process\.env\.NODE_ENV/g, JSON.stringify(process.env.NODE_ENV));
        switch(opath.base) {
            case 'lodash.js':
            case '_global.js':
                code = code.replace('Function(\'return this\')()', 'this');
                break;
            case '_html.js':
                code = 'module.exports = false;';
                break;
            case '_microtask.js':
                code = code.replace('if(Observer)', 'if(false && Observer)');
                // IOS 1.10.2 Promise BUG
                code = code.replace('Promise && Promise.resolve', 'false && Promise && Promise.resolve');
                break;
            case '_freeGlobal.js':
                code = code.replace('module.exports = freeGlobal;', 'module.exports = freeGlobal || this;')
        }
        let config = util.getConfig();
        if (config.output === 'ant' && opath.dir.substr(-19) === 'wepy-async-function') {
            code = '';
        }
        return code;
    },

    compile (lang, code, type, opath) {
        let config = util.getConfig();
        src = cache.getSrc();
        dist = cache.getDist();
        npmPath = path.join(currentPath, dist, 'npm' + path.sep);

        if (!code) {
            code = util.readFile(path.join(opath.dir, opath.base));
            if (code === null) {
                throw '打开文件失败: ' + path.join(opath.dir, opath.base);
            }
        }

        let compiler = loader.loadCompiler(lang);

        if (!compiler) {
            return;
        }

        compiler(code, config.compilers[lang] || {}).then(compileResult => {
            let sourceMap;
            if (typeof(compileResult) === 'string') {
                code = compileResult;
            } else {
                sourceMap = compileResult.map;
                code = compileResult.code;
            }
            if (type !== 'npm') {
                if (type === 'page' || type === 'app') {
                    code = code.replace(/exports\.default\s*=\s*(\w+);/ig, function (m, defaultExport) {
                        if (defaultExport === 'undefined') {
                            return '';
                        }
                        if (type === 'page') {
                            let pagePath = path.join(path.relative(appPath.dir, opath.dir), opath.name).replace(/\\/ig, '/');
                            return `\nPage(require('wepy').default.$createPage(${defaultExport} , '${pagePath}'));\n`;
                        } else {
                            appPath = opath;
                            let appConfig = JSON.stringify(config.appConfig || {});
                            let appCode = `\nApp(require('wepy').default.$createApp(${defaultExport}, ${appConfig}));\n`;
                            if (config.cliLogs) {
                                appCode += 'require(\'./_wepylogs.js\')\n';
                            }
                            return appCode;
                        }
                    });
                }
            }

            code = this.resolveDeps(code, type, opath);

            if (type === 'npm' && opath.ext === '.wpy') { // 第三方npm组件，后缀恒为wpy
                cWpy.compile(opath);
                return;
            }

            let target;
            if (type !== 'npm') {
                target = util.getDistPath(opath, 'js');
            } else {
                code = this.npmHack(opath, code);
                target = path.join(npmPath, path.relative(opath.npm.modulePath, path.join(opath.dir, opath.base)));
            }

            if (sourceMap) {
                sourceMap.sources = [opath.name + '.js'];
                sourceMap.file = opath.name + '.js';
                var Base64 = require('js-base64').Base64;
                code += `\r\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,${Base64.encode(JSON.stringify(sourceMap))}`;
            }

            let plg = new loader.PluginHelper(config.plugins, {
                type: type,
                code: code,
                file: target,
                output (p) {
                    util.output(p.action, p.file);
                },
                done (result) {
                    util.output('写入', result.file);
                    util.writeFile(target, result.code);
                }
            });
            // 缓存文件修改时间戳
            cache.saveBuildCache();
        }).catch((e) => {
            util.error(e);
        });
    }

}
