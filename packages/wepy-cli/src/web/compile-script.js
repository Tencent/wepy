import path from 'path';

import util from '../util';
import loader from '../loader';
import resolve from '../resolve';
import cache from '../cache';

import { getInstance } from './modulemap';

import main from './index';



const currentPath = util.currentDir;
const src = cache.getSrc();
const dist = cache.getDist();
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

            let source = '';

            let dep = {}, npmInfo;

            if (lib[0] === '.') { // require('./something'');
                source = path.join(opath.dir, lib);  // e:/src/util
            } else if (lib.indexOf('/') === -1 || lib.indexOf('/') === lib.length - 1) {  //        require('asset');

                let o = resolve.getMainFile(lib);
                if (!o) {
                    let relative = path.relative(util.currentDir, wpy.script.src);
                    throw Error(`文件${relative}中，找不到模块: ${lib}`);
                }
                let pkg = o.pkg;
                let main = pkg.main || 'index.js';
                if (lib === 'axios') {
                    main = path.join('dist', 'axios.js');
                } else if (lib === 'vue') {
                    main = path.join('dist', 'vue.js');
                }
                if (pkg.browser && typeof pkg.browser === 'string') {
                    main = pkg.browser;
                }
                source = path.join(o.dir, main);
                lib += path.sep + main;
                npmInfo = o;
            } else { // require('babel-runtime/regenerator')
                //console.log('3: ' + lib);
                source = path.join(wpy.npm.modulePath, lib);
                npmInfo = wpy.npm;
            }

            if (path.extname(source)) {
                if (util.isFile(source)) {
                } else if (util.isDir(source) && util.isFile(source + path.sep + 'index.js')) {
                    source = source + path.sep + 'index.js';
                } else {
                    source = null;
                }
            } else {
                if (util.isFile(source + wpyExt)) {
                    source += wpyExt;
                } else if (util.isFile(source + '.js')) {
                    source += '.js';
                } else {
                    source = null;
                }
            }

            if (!source) {
                throw ('找不到文件: ' + source);
            }
            
            mmap.add(source);

            let wepyRequireId = mmap.get(source);
            dep.path = source;
            if (npmInfo) {
                dep.npm = npmInfo;
            }
            dep.id = wepyRequireId;
            depences.push(dep);
            return `__wepy_require(${wepyRequireId})`;
        });
        return depences;
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

            let matchs = wpy.script.code.match(/exports\.default\s*=\s*(((?!undefined).)*);/i), defaultExport;
            // let matchs = wpy.script.code.match(/exports\.default\s*=\s*(\w+);/i), defaultExport;

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
