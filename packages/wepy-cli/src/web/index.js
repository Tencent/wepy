import path from 'path';
import util from '../util';
import cache from '../cache';
import compileWpy from '../compile-wpy';

import loader from '../loader';

import ModuleMap from './moduleMap';

const WEAPP_TAGS = ['view', 'text', 'navigator', 'image'];
const HTML_TAGS = ['div', 'span', 'a', 'img'];


const currentPath = util.currentDir;
const src = cache.getSrc();
const dist = cache.getDist();
const modulesPath = path.join(currentPath, 'node_modules' + path.sep);
const npmPath = path.join(currentPath, dist, 'npm' + path.sep);

let appPath;
let map = new ModuleMap();

export default {

    replaceWXML (str) {
        WEAPP_TAGS.forEach((v, i) => {
            let openreg = new RegExp(`<${v}`, 'ig'),
                closereg = new RegExp(`<\\${v}`, 'ig');
            str = str.replace(openreg, `<${HTML_TAGS[i]}`).replace(closereg, `<\\${HTML_TAGS[i]}`);
        });
        return str.replace(/[\r\n]/ig, '');
    },

    toWeb (file) {
        let src = cache.getSrc();
        let ext = cache.getExt();
        let apppath = path.parse(path.join(util.currentDir, src, file));
        let appWpy = compileWpy.resolveWpy(apppath);
        let pages = [];

        if (appWpy.config.pages && appWpy.config.pages.length) {
            appWpy.config.pages.forEach(v => {
                pages.push(compileWpy.resolveWpy(path.parse(path.join(util.currentDir, src, v + ext))));
            });
        } else {
            util.error('未检测到配置的页面文件。请检查' + util.getRelative(apppath));
            return;
        }
        debugger;

        this.compile([appWpy].concat(pages));
    },

    compile (wpys) {

        let config = util.getConfig();
        let params = cache.getParams();
        let wpyExt = params.wpyExt;
        let tasks = [];

        let singleFile = false;

        if (typeof(wpys) === 'string') {
            
            if (map.get(wpys) !== undefined)
                return;

            if (path.parse(wpys).ext === wpyExt) {
                wpys = [compileWpy.resolveWpy(wpys)];
            } else {
                wpys = [{
                    script: {
                        code: util.readFile(wpys),
                        src: wpys,
                        type: 'js'
                    }
                }];
            }
            singleFile = true;
        }
        wpys.forEach((wpy, i) => {
            let compiler = loader.loadCompiler(wpy.script.type);
            if (!compiler) {
                return;
            }
            tasks.push(
                compiler(wpy.script.code, config.compilers[wpy.script.type] || {}).then(rst => {
                    if (rst.code) {
                        wpy.script.code = rst.code;
                        wpy.script.map = rst.map;
                    } else {
                        wpy.script.code = rst;
                    }
                    wpy.type = singleFile ? 'require' : ((i === 0) ? 'app' : 'page');
                    return wpy;
                })
            );
        });

        Promise.all(tasks).then((compiled) => {
            compiled.forEach(wpy => {
                this.resolveMap(wpy);
            });
        }).catch(e => {
            console.log(e);
        });
    },

    resolveMap (wpy) {

        let opath = path.parse(wpy.script.src);

        map.add(wpy.script.src);

        console.log(map);

        let params = cache.getParams();
        let wpyExt = params.wpyExt;

        if (!wpy.code)


        wpy.script.code = wpy.script.code.replace(/require\(['"]([\w\d_\-\.\/]+)['"]\)/ig, (match, lib) => {

            console.log(match, lib);

            let resolved = lib;

            let target = '', source = '', ext = '', needCopy = false;


            let isNPM = /^node_modules/.test(path.relative(util.currentDir, wpy.script.src));

            if (lib[0] === '.') { // require('./something'');
                source = path.join(opath.dir, lib);  // e:/src/util
                if (isNPM) {
                    target = path.join(npmPath, path.relative(modulesPath, source));
                    needCopy = true;
                } else {
                    target = source.replace(path.sep + 'src' + path.sep, path.sep + 'dist' + path.sep);   // e:/dist/util
                    needCopy = false;
                }
            } else if (lib.indexOf('/') === -1 || lib.indexOf('/') === lib.length - 1) {  //        require('asset');
                let pkg = this.getPkgConfig(lib);
                if (!pkg) {
                    throw Error('找不到模块: ' + lib);
                }
                let main = pkg.main || 'index.js';
                if (pkg.browser && typeof pkg.browser === 'string') {
                    main = pkg.browser;
                }
                source = path.join(modulesPath, lib, main);
                target = path.join(npmPath, lib, main);
                lib += path.sep + main;
                ext = '';
                needCopy = true;
            } else { // require('babel-runtime/regenerator')
                //console.log('3: ' + lib);
                source = path.join(modulesPath, lib);
                target = path.join(npmPath, lib);
                ext = '';
                needCopy = true;
            }

            if (util.isFile(source + wpyExt)) {
                ext = wpyExt;
            } else if (util.isFile(source + '.js')) {
                ext = '.js';
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

            // 第三方组件
            if (/\.wpy$/.test(resolved)) {
                target = target.replace(/\.wpy$/, '') + '.js';
                resolved = resolved.replace(/\.wpy$/, '') + '.js';
                lib = resolved;
            }

                console.log(source);
                this.compile(source);
                return;

            if (needCopy) {
                return;
                if (!cache.checkBuildCache(source)) {
                    cache.setBuildCache(source);
                    util.log('依赖: ' + path.relative(process.cwd(), target), '拷贝');
                    /*let dirname = path.dirname(target);
                    mkdirp.sync(dirname);*/

                    this.compile('js', null, 'npm', path.parse(source));

                }
                /*if (!buildCache[source] || buildCache[source] !== getModifiedTime(source)) {
                    buildCache[source] = getModifiedTime(source);
                    console.log('copying........' + target + ' ===== ' + source);
                    let dirname = path.dirname(target);
                    buildCache[source] = getModifiedTime(source);
                    mkdirp.sync(dirname);
                    gulp.src(source).pipe(change(compileJS)).pipe(gulp.dest(dirname));
                }*/
            }
            return;
            if (isNPM) {
                if (lib[0] !== '.') {
                    resolved = path.join('..' + path.sep, path.relative(opath.dir, modulesPath), lib);
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

        debugger;
    },
    getPkgConfig (lib) {
        let pkg = util.readFile(path.join(modulesPath, lib, 'package.json'));
        try {
            pkg = JSON.parse(pkg);
        } catch (e) {
            pkg = null;
        }
        return pkg;
    },





}
