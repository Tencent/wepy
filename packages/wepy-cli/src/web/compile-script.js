import path from 'path';

import util from '../util';
import loader from '../loader';
import cache from '../cache';

import { getInstance } from './modulemap';

import main from './index';



const currentPath = util.currentDir;
const src = cache.getSrc();
const dist = cache.getDist();
const modulesPath = path.join(currentPath, 'node_modules' + path.sep);
const npmPath = path.join(currentPath, dist, 'npm' + path.sep);

let mmap

export default {
    resolveMap (wpy) {

        let opath = path.parse(wpy.script.src);

        let id = mmap.add(wpy.script.src, {type: 'script', source: wpy});
        wpy.script.id = id;

        //console.log(map);

        let params = cache.getParams();
        let wpyExt = params.wpyExt;

        let depences = [];

        wpy.script.code = wpy.script.code.replace(/require\(['"]([\w\d_\-\.\/]+)['"]\)/ig, (match, lib) => {

            if (lib === 'wepy') 
                lib = 'wepy-web';

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
                    let relative = path.relative(util.currentDir, wpy.script.src);
                    throw Error(`文件${relative}中，找不到模块: ${lib}`);
                }
                let main = pkg.main || 'index.js';
                if (lib === 'axios') {
                    main = path.join('dist', 'axios.js');
                } else if (lib === 'vue') {
                    main = path.join('dist', 'vue.js');
                }
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

            mmap.add(source);

            let wepyRequireId = mmap.get(source);
            depences.push(source);
            return `__wepy_require(${wepyRequireId})`;

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
        return depences;
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

    compile (wpy) {
        mmap = getInstance();
        let config = util.getConfig();
        let compiler = loader.loadCompiler(wpy.script.type);
        if (!compiler) {
            return;
        }
        mmap.setPending(wpy.script.src);
        if (wpy.script.type === 'js') {
            util.output('依赖', wpy.script.src);
        } else {
            util.output('编译', wpy.script.src);
        }
        return compiler(wpy.script.code, config.compilers[wpy.script.type] || {}).then(rst => {
            if (rst.code) {
                wpy.script.code = rst.code;
                wpy.script.map = rst.map;
            } else {
                wpy.script.code = rst;
            }

            let matchs = wpy.script.code.match(/exports\.default\s*=\s*(\w+);/i), defaultExport;

            if (matchs && matchs.length) {
                defaultExport = matchs[1];

                if (wpy.type === 'page') {
                    main.addPage(wpy.path, wpy);
                } else if (wpy.type === 'app') {
                    if (matchs) {
                        wpy.script.code = wpy.script.code.replace(/exports\.default\s*=\s*(\w+);/i, '');
                        wpy.script.code += `\nrequire('wepy').default.$createApp(${defaultExport}, $$WEPY_APP_PARAMS_PLACEHOLDER$$);\n`;
                    }
                }
            }
            return wpy;
        }).then(wpy => {
            let depences = this.resolveMap(wpy);
            let newTasks = [];
            depences.forEach(dep => {
                newTasks.push(main.compile(dep));
            });
            return Promise.all(newTasks);
        });
    }
}
