import path from 'path';
import util from '../util';
import cache from '../cache';
import compileWpy from '../compile-wpy';


import cScript from './compile-script';
import cTemplate from './compile-template';
import cStyle from './compile-style';


import loader from '../loader';

import mmap from './modulemap';


const currentPath = util.currentDir;
const src = cache.getSrc();
const dist = cache.getDist();
const modulesPath = path.join(currentPath, 'node_modules' + path.sep);
const npmPath = path.join(currentPath, dist, 'npm' + path.sep);

let appPath;

let pages = {};

export default {

    addPage (k, v) {
        pages[k] = v;
    },
    toWeb (file) {
        let src = cache.getSrc();
        let ext = cache.getExt();
        let appWpy, apppath;
        if (typeof(file) === 'object') {
            appWpy = file;
            apppath = appWpy.script.src;
        } else {
            apppath = path.parse(path.join(util.currentDir, src, file));
            appWpy = compileWpy.resolveWpy(apppath);
        }
        let wpypages = [];

        this.app = appWpy;
        if (appWpy.config.pages && appWpy.config.pages.length) {
            appWpy.config.pages.forEach(v => {
                wpypages.push(compileWpy.resolveWpy(path.parse(path.join(util.currentDir, src, v + ext))));
            });
        } else {
            util.error('未检测到配置的页面文件。请检查' + util.getRelative(apppath));
            return;
        }

        this.compile([appWpy].concat(wpypages)).then(rst => {
            debugger;
            let mapArr = mmap.getArray();
            let code = '';

            let style = '';

            mapArr.forEach((v, i) => {
                let p = path.relative(util.currentDir, v.source.script.src);

                code += '/***** module ' + i + ' start *****/\n';
                code += '/***** ' + p + ' *****/\n';
                code += 'function(module, exports, __wepy_require) {'
                if (v.type === 'script') {
                    code += v.source.script.code + '\n';
                    if (v.source.template && v.source.template.id !== undefined) {
                        code += '\nexports.default.template=__wepy_require(' + v.source.template.id + ');\n'
                    }
                } else if (v.type === 'template') {
                    code += 'module.exports = "' + v.source.template.code.replace(/\r/ig, '').replace(/\n/ig, '\\n').replace(/"/ig, '\\"') + '"';
                } else if (v.type === 'style') {
                    style += v.source.style.code;
                }
                code += '}';
                if (i !== mapArr.length - 1) {
                    code += ',';
                }
                code += '/***** module ' + i + ' end *****/\n\n\n';
            });

code = `
(function(modules) { 
   // The module cache
   var installedModules = {};
   // The require function
   function __webpack_require__(moduleId) {
       // Check if module is in cache
       if(installedModules[moduleId])
           return installedModules[moduleId].exports;
       // Create a new module (and put it into the cache)
       var module = installedModules[moduleId] = {
           exports: {},
           id: moduleId,
           loaded: false
       };
       // Execute the module function
       modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
       // Flag the module as loaded
       module.loaded = true;
       // Return the exports of the module
       return module.exports;
   }
   // expose the modules object (__webpack_modules__)
   __webpack_require__.m = modules;
   // expose the module cache
   __webpack_require__.c = installedModules;
   // __webpack_public_path__
   __webpack_require__.p = "/";
   // Load entry module and return exports
   return __webpack_require__(${appWpy.script.id});
})([
${code}
]);
`
            let config = {}, routes = {}, k;

            for (k in pages) {
                routes[k] = mmap.get(pages[k].script.src);
            }

            config.routes = routes;
            config.style = style;

            code = code.replace('$$WEPY_APP_PARAMS_PLACEHOLDER$$', JSON.stringify(config));

            util.writeFile(util.currentDir + '/web/dist.js', code);
        }).catch(e => {
            console.error(e);
        });
    },

    compile (wpys) {

        let config = util.getConfig();
        let params = cache.getParams();
        let wpyExt = params.wpyExt;
        let tasks = [];

        let singleFile = false;

        if (typeof(wpys) === 'string') {
            
            let wpy = mmap.getObject(wpys);
            if (wpy) {
                return Promise.resolve(wpy);
            }

            if (path.parse(wpys).ext === wpyExt) {
                wpys = [compileWpy.resolveWpy(wpys)];
            } else {
                wpys = [{
                    script: {
                        code: util.readFile(wpys),
                        src: wpys,
                        type: 'babel'
                    }
                }];
            }
            singleFile = true;
        }
        wpys.forEach((wpy, i) => {
            let tmp;
            wpy.type = singleFile ? 'require' : ((i === 0) ? 'app' : 'page');

            tmp = cScript.compile(wpy);

            if (!tmp) {
                throw 'error';
            }

            tasks.push(tmp);

            if (wpy.template && wpy.template.code && !wpy.template.id) {
                tmp = cTemplate.compile(wpy);

                if (!tmp) {
                    throw 'error';
                }

                tasks.push(tmp);
            }

            if (wpy.style && wpy.style.code && !wpy.style.id) {
                tmp = cStyle.compile(wpy);

                if (!tmp) {
                    throw 'error';
                }
                tasks.push(tmp);
            }
        });

        if (singleFile) {
            return Promise.resolve(tasks[0]);
        } else {
            return Promise.all(tasks);
        }
    },






}
