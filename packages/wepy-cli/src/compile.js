/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import path from 'path';
import chokidar from 'chokidar';
import compareVersions from 'compare-versions';
import ignore from 'ignore';

import cache from './cache';
import util from './util';
import cWpy from './compile-wpy';
import cStyle from './compile-style';
import cScript from './compile-script';

import loader from './loader';
import resolve from './resolve';

import toWeb from './web/index';

let watchReady = false;
let preventDup = {};


export default {
    /**
     * find parent, import xxxx from xxx;
     */
    findParents (file) {
        let src = cache.getSrc();
        let files = util.getFiles(src);
        let ext = cache.getExt();

        let parents = [];

        let reg = new RegExp('\\.(' + ext.substr(1) + '|js)$');

        files = files.filter((v) => reg.test(v));

        files.forEach((f) => {
            let opath = path.parse(path.join(util.currentDir, src, f));
            let content = util.readFile(opath);
            content && content.replace(/import\s*([{\w\d-_}]*)\s*from\s*['"](.*)['"]/ig, (match, name, importpath) => {
                let resolved = resolve.resolveAlias(importpath, opath);
                if (path.extname(resolved) === '')
                    resolved += ext;
                let compath;
                if (path.isAbsolute(resolved)) {
                    compath = path.resolve(resolved);
                } else {
                    compath = path.join(opath.dir, resolved);
                }
                if (compath === path.join(util.currentDir, src, file)) {
                    if (!reg.test(f)) {
                        parents = parents.concat(this.findReference(f));
                    } else {
                        // 组件的父组件无需更新，只有父页面需要更新
                        if (f.indexOf('components') !== -1) { // 如果是父组件，继续查找父组件的父页面。
                            parents = parents.concat(this.findParents(f));
                        } else
                            parents.push(f);
                    }
                }
            });
        });
        return util.unique(parents).filter((v) => v.indexOf('components') === -1);
    },
    _cacheReferences: null,
    /**
     * find src, <script src="">
     */
    findReference (file) {
        let src = cache.getSrc();
        let files = util.getFiles(src);
        let ext = cache.getExt();

        let refs = [];
        let filepath = path.join(util.currentDir, src, file);

        if (this._cacheReferences === null) {
            this._cacheReferences = {};
            let reg = new RegExp('\\' + ext + '$');

            files = files.filter((v) => reg.test(v));

            files.forEach((f) => {
                let opath = path.parse(path.join(util.currentDir, src, f));
                let content = util.readFile(opath);

                let wpy = cWpy.resolveWpy(opath);
                let links = {};

                ['script', 'template', 'style'].forEach(t => {
                    if (wpy[t]) {
                        if (wpy[t].link === true) {
                            this._cacheReferences[wpy[t].src] = this._cacheReferences[wpy[t].src] || [];
                            this._cacheReferences[wpy[t].src].push(f);
                        } else if (wpy[t].link === undefined && wpy[t].length) { // styles
                            wpy[t].forEach(s => {
                                if (s.link) {
                                    this._cacheReferences[s.src] = this._cacheReferences[s.src] || [];
                                    this._cacheReferences[s.src].push(f);
                                }
                            });
                        }
                    }
                });
            });
        }
        return this._cacheReferences[filepath] || [];
    },
    watch (cmd) {
        cmd.watch = false;

        let wepyrc = util.getConfig();
        let src = cmd.source || wepyrc.src || 'src';
        let dist = cmd.target || wepyrc.target || 'dist';
        chokidar.watch(`.${path.sep}${src}`, wepyrc.watchOption || {}).on('all', (evt, filepath) => {
            if ((evt === 'change' || evt === 'add') && watchReady && !preventDup[filepath]) {
                preventDup[filepath] = evt;
                cmd.file = path.relative(src, filepath);
                util.log('文件: ' + filepath, '变更');
                this.build(cmd);
                setTimeout(() => {
                    preventDup[filepath] = false;
                }, 500);
            }
        }).on('ready', () => {
            watchReady = true;
            util.log('开始监听文件改动。', '信息');
        });
    },
    checkCompiler (compilers) {
        if (compilers === undefined) {
            util.log('检测到老版本config文件，请先更新配置文件版本，参考链接：https://github.com/wepyjs/wepy#wepyconfigjs-配置文件说明', '错误');
            return false;
        }
        let k, exsit = true;
        for (k in compilers) {
            if (!loader.loadCompiler(k)) {
                return false;
            }
        }
        return true;
    },
    checkPlugin (plugins = {}) {
        return loader.loadPlugin(plugins);
    },

    wepyUpdate(required = '1.7.0') {
        let o = resolve.getPkg('wepy') || {};
        let pkg = o.pkg || {version: '0.0.0'};
        return compareVersions(required, pkg.version) === 1;
    },

    init (config) {
        let wepyrc = util.getConfig();
        if (!wepyrc) {
            util.error('没有检测到wepy.config.js文件, 请执行`wepy new demo`创建');
            return false;
        }

        resolve.init(wepyrc.resolve || {});
        loader.attach(resolve);

        if (this.wepyUpdate()) { // 需要更新wepy版本
            util.log('检测到wepy版本不符合要求，正在尝试更新，请稍等。', '信息');
            util.exec(`npm install wepy --save`).then(d => {
                util.log(`已完成更新，重新启动编译。`, '完成');
                config.cache = false;
                this.build(config);
            }).catch(e => {
                util.log(`安装wepy失败，请尝试运行命令 "npm install wepy --save" 进行安装。`, '错误');
                console.log(e);
            });
            return false;
        }

        if (!this.checkCompiler(wepyrc.compilers) || !this.checkPlugin(wepyrc.plugins)) {
            util.exec(`npm info ${loader.missingNPM}`, true).then(d => {
                util.log('检测到有效NPM包资源，正在尝试安装，请稍等。', '信息');
                util.exec(`npm install ${loader.missingNPM} --save-dev`).then(d => {
                    util.log(`已完成安装 ${loader.missingNPM}，重新启动编译。`, '完成');
                    this.build(config);
                }).catch(e => {
                    util.log(`安装插件失败：${loader.missingNPM}，请尝试运行命令 "npm install ${loader.missingNPM} --save-dev" 进行安装。`, '错误');
                    console.log(e);
                });
            }).catch(e => {
                util.log(`不存在插件：${loader.missingNPM}，请检测是否拼写错误。`, '错误');
                console.log(e);
            });
            return false;
        }



        if (config.output === 'web') {
            wepyrc.build = wepyrc.build || {};
            wepyrc.build.web = wepyrc.build.web || {};
            wepyrc.build.web.dist = wepyrc.build.web.dist || 'web';
            wepyrc.build.web.src = wepyrc.build.web.src || 'src';
            if (wepyrc.build.web.resolve)
                wepyrc.resolve = Object.assign({}, wepyrc.resolve, wepyrc.build.web.resolve);
            wepyrc.output = 'web';

            resolve.init(wepyrc.resolve || {});
            loader.attach(resolve);

            if (!resolve.getPkg('wepy-web')) {
                util.log('正在尝试安装缺失资源 wepy-web，请稍等。', '信息');
                util.exec(`npm install wepy-web --save`).then(d => {
                    util.log(`已完成安装 wepy-web，重新启动编译。`, '完成');
                    this.build(config);
                }).catch(e => {
                    util.log(`安装插件失败：wepy-web，请尝试运行命令 "npm install wepy-web --save" 进行安装。`, '错误');
                    console.log(e);
                });
                return false;
            }
        } else if (config.output === 'ant') {
            wepyrc.build = wepyrc.build || {};
            wepyrc.build.ant = wepyrc.build.ant || {};
            wepyrc.build.ant.dist = wepyrc.build.ant.dist || 'ant';
            wepyrc.build.ant.src = wepyrc.build.ant.src || 'src';
            if (wepyrc.build.ant.resolve)
                wepyrc.resolve = Object.assign({}, wepyrc.resolve, wepyrc.build.ant.resolve);
            wepyrc.output = 'ant';

            resolve.init(wepyrc.resolve || {});
            loader.attach(resolve);

            if (!resolve.getPkg('wepy-ant')) {
                util.log('正在尝试安装缺失资源 wepy-ant，请稍等。', '信息');
                util.exec(`npm install wepy-ant --save`).then(d => {
                    util.log(`已完成安装 wepy-ant，重新启动编译。`, '完成');
                    this.build(config);
                }).catch(e => {
                    util.log(`安装插件失败：wepy-ant，请尝试运行命令 "npm install wepy-ant --save" 进行安装。`, '错误');
                    console.log(e);
                });
                return false;
            }
        }

        return true;
    },

    build (cmd) {

        let wepyrc = util.getConfig();

        let src = cmd.source || wepyrc.src;
        let dist = cmd.target || wepyrc.target;
        let ext = cmd.wpyExt || wepyrc.wpyExt;

        if (src === undefined)
            src = 'src';
        if (dist === undefined)
            dist = 'dist';
        if (ext === undefined)
            ext = '.wpy';

        cmd.source = src;
        cmd.dist = dist;
        cmd.wpyExt = ext;

        if (ext.indexOf('.') === -1)
            ext = '.' + ext;

        // WEB 模式下，不能指定文件编译
        let file = (cmd.output !== 'web') ? cmd.file : '';

        let current = process.cwd();
        let files = file ? [file] : util.getFiles(src);

        cache.setParams(cmd);
        cache.setSrc(src);
        cache.setDist(dist);
        cache.setExt(ext);


        // If dist/npm/wepy is not exsit, then clear the build cache.
        if (!util.isDir(path.join(util.currentDir, dist, 'npm', 'wepy'))) {
            cmd.cache = false;
        }
        if (!cmd.cache) {
            cache.clearBuildCache();
        }

        if (file) { // 指定文件编译时
            if (file.indexOf(ext) === -1) { // 是wpy文件，则直接编译，否则检查引用源
                let refs = this.findReference(file);
                if (refs.length === 0) { // 无引用源时，编译当前文件，否则编译引用源。
                    files = [file];
                } else {
                    files = refs;
                }
            } else if (file.indexOf('components') !== -1) { // 是wpy 文件，而且是组件
                let parents = this.findParents(file);
                files = parents.concat([file]);
            }
        }

        if (files.some((v) => v === 'app' + ext)) { // 如果编译文件包含app.wpy，且第一个不是 app.wpy
            if (util.isFile(path.join(current, src, 'app' + ext))) { // src/app.wpy 存在, 则把它放在第一位, 因为后面需要取页面路径
                let newFiles = ['app' + ext].concat(files.filter(v => v !== 'app' + ext));
                files = newFiles;
            } else {
                util.error('根目录不存在app' + ext);
            }
        }

        let igfiles = util.getIgnore();
        if (igfiles) {
            let ig = ignore().add(igfiles);
            files = ig.filter(files);
        }
        if (wepyrc.cliLogs) {
            util.cliLogs = true;
            util.clearLog();
        } else {
            util.removeLog();
        }

        if (cmd.output === 'web') {
            files.forEach((f, i) => {
                if (i === 0) {
                    toWeb.toWeb(f, cmd.platform || 'browser');
                } else {
                    toWeb.copy(path.join(util.currentDir, src, f));
                }
            })
        } else {
            files.forEach((f) => {
                let opath = path.parse(path.join(current, src, f));
                if (file) {
                    this.compile(opath);
                } else { // 不指定文件编译时，跳过引用文件编译
                    let refs = this.findReference(f);
                    if (!refs.length)
                        this.compile(opath);
                }
            });
        }
        if (cmd.watch) {
            util.isWatch = true;
            this.watch(cmd);
        }
    },
    compile(opath) {
        let src = cache.getSrc();
        let dist = cache.getDist();
        let ext = cache.getExt();
        let config = util.getConfig();

        if (!util.isFile(opath)) {
            util.error('文件不存在：' + util.getRelative(opath));
            return;
        }

        switch(opath.ext) {
            case ext:
                cWpy.compile(opath);
                break;
            case '.less':
                cStyle.compile('less', opath);
                break;
            case '.sass':
                cStyle.compile('sass', opath);
                break;
            case '.scss':
                cStyle.compile('scss', opath);
                break;
            case '.js':
                cScript.compile('babel', null, 'js', opath);
                break;
            case '.ts':
                cScript.compile('typescript', null, 'ts', opath);
                break;
            default:
                util.output('拷贝', path.join(opath.dir, opath.base));

                let plg = new loader.PluginHelper(config.plugins, {
                    type: opath.ext.substr(1),
                    code: null,
                    file: path.join(opath.dir, opath.base),
                    output (p) {
                        util.output(p.action, p.file);
                    },
                    done (rst) {
                        if (rst.code) {
                            let target = util.getDistPath(path.parse(rst.file));
                            util.writeFile(target, rst.code);
                        } else {
                            util.copy(path.parse(rst.file));
                        }
                    },
                    error (rst) {
                        util.warning(rst.err);
                        util.copy(path.parse(rst.file));
                    }
                });
        }
    }
}
