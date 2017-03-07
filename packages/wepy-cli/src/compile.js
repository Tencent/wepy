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
                reg = new RegExp('\\' + ext + '$');
                if (!reg.test(importpath))
                    importpath = importpath + ext;

                if (path.join(opath.dir, importpath) === path.join(util.currentDir, src, file)) {
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
    /**
     * find src, <script src="">
     */
    findReference (file) {
        let src = cache.getSrc();
        let files = util.getFiles(src);
        let ext = cache.getExt();

        let refs = [];

        let reg = new RegExp('\\' + ext + '$');

        files = files.filter((v) => reg.test(v));

        files.forEach((f) => {
            let opath = path.parse(path.join(util.currentDir, src, f));
            let content = util.readFile(opath);

            content.replace(/<(script|template|style)\s.*src\s*=\s*['"](.*)['"]/ig, (match, tag, srcpath) => {
                if (path.join(opath.dir, srcpath) === path.join(util.currentDir, src, file)) {
                    refs.push(f);
                }
            });
        });

        return refs;
    },
    watch (config) {
        config.watch = false;

        let wepyrc = util.getConfig();
        let src = config.source || wepyrc.src || 'src';
        let dist = config.output || wepyrc.output || 'dist';



        chokidar.watch(`.${path.sep}${src}`, {
            depth: 99
        }).on('all', (evt, filepath) => {
            if ((evt === 'change' || evt === 'add') && watchReady && !preventDup[filepath]) {
                preventDup[filepath] = evt;
                config.file = path.join('..', filepath);
                util.log('文件: ' + filepath, '变更');
                this.build(config);
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

    wepyUpdate(required = '1.4.5') {
        let pkgfile = path.join(util.currentDir, 'node_modules', 'wepy', 'package.json');
        let pkg;
        try {
            pkg = JSON.parse(util.readFile(pkgfile));
        } catch (e) {
            pkg = {version: '0.0.0'};
        }
        return compareVersions(required, pkg.version) === 1;
    },

    build (config) {
        let wepyrc = util.getConfig();
        if (!wepyrc) {
            util.error('没有检测到wepy.config.js文件, 请执行`wepy new demo`创建');
            return;
        }
        config.noCache = config.rawArgs.indexOf('--no-cache') !== -1;

        if (this.wepyUpdate()) { // 需要更新wepy版本
            util.log('检测到wepy版本不符合要求，正在尝试更新，请稍等。', '信息');
            util.exec(`npm install wepy --save`).then(d => {
                util.log(`已完成更新，重新启动编译。`, '完成');
                this.build(config);
            }).catch(e => {
                util.log(`安装wepy失败，请尝试运行命令 "npm install wepy --save" 进行安装。`, '错误');
                console.log(e);
            });
            return;
        }
        if (config.noCache) {
            cache.clearBuildCache();
        }
        if (!this.checkCompiler(wepyrc.compilers) || !this.checkPlugin(wepyrc.plugins)) {
            util.exec(`npm info ${loader.missingNPM}`, true).then(d => {
                util.log('检测到有效NPM包资源，正在尝试安装，请稍等。', '信息');
                util.exec(`npm install ${loader.missingNPM} --save-dev`).then(d => {
                    util.log(`已完成安装 ${loader.missingNPM}，重新启动编译。`, '完成');
                    this.build(config);
                }).catch(e => {
                    util.log(`安装插件失败：${loader.missingNPM}，请尝试运行命令 "npm install ${name} --save-dev" 进行安装。`, '错误');
                    console.log(e);
                });
            }).catch(e => {
                util.log(`不存在插件：${loader.missingNPM}，请检测是否拼写错误。`, '错误');
                console.log(e);
            });
            return;
        }

        let src = config.source || wepyrc.src;
        let dist = config.output || wepyrc.output;
        let ext = config.wpyExt || wepyrc.wpyExt;

        if (src === undefined)
            src = 'src';
        if (dist === undefined)
            dist = 'dist';
        if (ext === undefined)
            ext = '.wpy';

        config.source = src;
        config.dist = dist;
        config.wpyExt = ext;

        if (ext.indexOf('.') === -1)
            ext = '.' + ext;

        let file = config.file;

        let current = process.cwd();
        let files = file ? [file] : util.getFiles(src);

        cache.setParams(config);
        cache.setSrc(src);
        cache.setDist(dist);
        cache.setExt(ext);

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



        if (config.watch) {
            this.watch(config);
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
            case '.scss':
                cStyle.compile('sass', opath);
                break;
            case '.js':
                cScript.compile('babel', null, 'js', opath);
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