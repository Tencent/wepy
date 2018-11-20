/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import path from 'path';
import util from '../util';
import cache from '../cache';
import compileWpy from '../compile-wpy';


import cScript from './compile-script';
import cTemplate from './compile-template';
import cStyle from './compile-style';
import {DOMParser, DOMImplementation} from 'xmldom';


import loader from '../loader';
import resolve from '../resolve';

import {getInstance, createInstance} from './modulemap';


const currentPath = util.currentDir;
const src = cache.getSrc();
const dist = cache.getDist();
const npmPath = path.join(currentPath, dist, 'npm' + path.sep);

let appPath;

let pages = {};

let mmap;

export default {

    addPage (k, v) {
        pages[k] = v;
    },
    replaceParams (str, params) {
        let k, reg;
        for (k in params) {
            reg = new RegExp('{{' + k +'}}', 'g');
            str = str.replace(reg, params[k]);
        }
        return str;
    },
    injectScript (html, scripts) {

        if (!scripts || !scripts.length)
            return;

        let head = html.getElementsByTagName('head')[0];
        let body = html.getElementsByTagName('body')[0];
        let doc = new DOMImplementation().createDocument();
        scripts.forEach(v => {
            let script = doc.createElement('script');
            if (v.src) {
                script.setAttribute('src', v.src);
            } else if (v.js) {
                script.appendChild(doc.createTextNode(v.js));
            }

            if (v.pos === 'body') {
                body.appendChild(script);
            } else {
                head.appendChild(script);
            }
        });
    },
    buildHtml (webConfig, platform) {
        let config = util.getConfig();

        if (webConfig.htmlTemplate) {
            let template = util.readFile(webConfig.htmlTemplate);
            if (!template) {
                util.error('找不到文件：' + webConfig.htmlTemplate);
                return;
            }

            let domParser = new DOMParser({errorHandler: {
                warning (x) {
                    if (x.indexOf(' unclosed xml attribute') > -1) {
                        // ignore warnings
                    } else {
                        util.warning('WARNING IN : ' + webConfig.htmlTemplate + '\n' + x);
                    }
                },
                error (x) {
                    util.warning('ERROR IN : ' + webConfig.htmlTemplate + '\n' + x);
                }
            }});

            // https://github.com/jindw/xmldom/blob/master/dom-parser.js#L13
            // https://github.com/jindw/xmldom/blob/master/sax.js#L157
            // without '/hmtl' it will throw unclosed xml attribute.
            let node = domParser.parseFromString(template, '/html');

            let target = this.replaceParams(webConfig.htmlOutput, {platform: platform});

            let scripts = [];

            const DEFAULT_INJECT = {
                qq: [{
                    pos: 'head',
                    src: '//i.gtimg.cn/channel/lib/components/adapt/adapt-3.0.js?_bid=2106&max_age=86400000'
                }, {
                    pos: 'head',
                    src: '//open.mobile.qq.com/sdk/qqapi.js?_bid=152'
                }],
                wechat: [{
                    pos: 'head',
                    src: '//res.wx.qq.com/open/js/jweixin-1.2.0.js'
                }],
                main: {
                    pos: 'head',
                    src: this.replaceParams(path.relative(path.parse(target).dir, webConfig.jsOutput), {platform: platform})
                }
            };
            if (webConfig.injectScripts === undefined) {
                webConfig.injectScripts = DEFAULT_INJECT;
            }
            if (webConfig.injectScripts !== false) {
                let pscript = webConfig.injectScripts[platform] || [];
                if (!Array.isArray(pscript)) {
                    pscript = [pscript];
                }
                scripts = scripts.concat(pscript);

                let mscript = webConfig.injectScripts.main || [];
                if (!Array.isArray(mscript)) {
                    mscript = [mscript];
                }
                scripts = scripts.concat(mscript);

                if (scripts.length) {
                    this.injectScript(node, scripts);
                }
            }

            util.output('写入', target);
            util.writeFile(target, node.toString(true));
        }
    },
    toWeb (file, platform) {
        let src = cache.getSrc();
        let ext = cache.getExt();
        let config = util.getConfig();
        let appWpy, apppath, platformId;


        let webConfig = config.build ? config.build.web : null;
        if (!webConfig){
            util.error('请检查 build.web 的配置');
            return;
        }

        mmap = createInstance();

        util.log('编译 WEB');

        this.buildHtml(webConfig, platform);

        util.log('入口: ' + file, '编译');
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
                let wpypage = compileWpy.resolveWpy(path.parse(path.join(util.currentDir, src, v + ext)));
                wpypage.path = v;
                wpypages.push(wpypage);
            });
        } else {
            util.error('未检测到配置的页面文件。请检查' + util.getRelative(apppath));
            return;
        }

        let tasks = [], components = {}, apis = {};

        tasks.push(this.compile([appWpy].concat(wpypages)));


        let wepyWebPkg = resolve.getPkg('wepy-web');

        // 注入平台wx hack 代码
        if (platform !== 'browser') {
            if (['wechat', 'qq'].indexOf(platform) > -1) {
                let platformFile = path.join(wepyWebPkg.dir, 'lib', 'platform', platform + '.js');
                platformId = mmap.add(platformFile);
                tasks.push(this.compile({
                    id: platformId,
                    path: platformFile,
                    npm: wepyWebPkg
                }));
            } else {
                util.warning('platform参数目前只支持 wechat 和 qq');
            }
        }

        // 如果存在引入的components，则将components编译至代码中。
        if (webConfig.components && webConfig.components.length) {
            webConfig.components.forEach(k => {
                let componentFile = path.join(wepyWebPkg.dir, 'lib', 'components', k + '.vue');
                components[k] = mmap.add(componentFile);
                tasks.push(this.compile({
                    id: components[k],
                    path: componentFile,
                    npm: wepyWebPkg
                }));
            });
        }
        // 如果存在引入的apis，则将apis编译至代码中。
        if (webConfig.apis && webConfig.apis.length) {
            webConfig.apis.forEach(k => {
                let apiFile = path.join(wepyWebPkg.dir, 'lib', 'apis', k);
                if (util.isFile(apiFile + '.vue')) {
                    apiFile = apiFile + '.vue';
                } else {
                    apiFile = apiFile + '.js';
                }
                apis[k] = mmap.add(apiFile);
                tasks.push(this.compile(apiFile));
            });
        }

        Promise.all(tasks).then(rst => {
            let mapArr = mmap.getArray();
            let code = '';

            let styleList = [];
            mapArr.forEach((v, i) => {
                let p = path.relative(util.currentDir, v.source.script.src);

                code += '/***** module ' + i + ' start *****/\n';
                code += '/***** ' + p + ' *****/\n';
                code += 'function(module, exports, __wepy_require, process, global) {'
                if (v.type === 'script') {
                    code += v.source.script.code + '\n';
                    if (v.source.template && v.source.template.id !== undefined) {
                        code += '\nexports.default.template=__wepy_require(' + v.source.template.id + ');\n'
                    }
                } else if (v.type === 'template') {
                    code += 'module.exports = "' + v.source.template.code.replace(/\\/ig, '\\\\').replace(/\r/ig, '').replace(/\n/ig, '\\n').replace(/"/ig, '\\"') + '"';
                } else if (v.type === 'style') {
                    let styleCode = '';
                    v.source.style.forEach(s => {
                        styleCode += s.code + '\r\n';
                    });
                    styleList.push(v.source.style.id);
                    code += 'module.exports = "' + styleCode.replace(/\\/ig, '\\\\').replace(/\r/ig, '').replace(/\n/ig, '\\n').replace(/"/ig, '\\"') + '"';
                }
                code += '}';
                if (i !== mapArr.length - 1) {
                    code += ',';
                }
                code += '/***** module ' + i + ' end *****/\n\n\n';
            });

code = `
(function(modules) {
   var process = {};
   var global = window;
   process.env = {
    NODE_ENV: '${process.env.NODE_ENV}'
   };
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
       modules[moduleId].call(module.exports, module, module.exports, __webpack_require__, process, global);
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
   $$WEPY_APP_PLATFORM_PLACEHOLDER$$
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
            config.style = styleList;
            config.components = components;
            config.apis = apis;

            if (platformId !== undefined) {
                code = code.replace('$$WEPY_APP_PLATFORM_PLACEHOLDER$$', `__webpack_require__(${platformId})`);
            } else {
                code = code.replace('$$WEPY_APP_PLATFORM_PLACEHOLDER$$', '');
            }
            code = code.replace('$$WEPY_APP_PARAMS_PLACEHOLDER$$', JSON.stringify(config));

            webConfig.jsOutput = webConfig.jsOutput || path.join(dist, 'dist.js');
            let target = this.replaceParams(path.join(util.currentDir, webConfig.jsOutput), {platform: platform});

            let plg = new loader.PluginHelper(config.plugins, {
                type: 'dist',
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


        // It's may be vue api component
        if (typeof wpys === 'string') {
            wpys = { path: wpys };
        }
        if (wpys.path) {
            if (mmap.getPending(wpys.path))
                return Promise.resolve(0);

            let wpy = mmap.getObject(wpys.path);
            if (wpy) {
                return Promise.resolve(wpy);
            }

            let opath = path.parse(wpys.path);

            if (opath.ext === wpyExt || opath.ext === '.vue') {
                let wpy = compileWpy.resolveWpy(wpys.path);
                if (!wpy) {
                    util.error(`检测到不存在组件 ${opath.name}`);
                    return;
                }
                wpys = [wpy];
            } else {
                let compileType = 'babel';
                // 如果是npm包, 而且后缀不为 .wpy，那么不进行babel编译
                if (opath.ext !== wpyExt && wpys.npm) {
                    compileType = 'js';
                }
                wpys = [{
                    script: {
                        code: util.readFile(wpys.path),
                        src: wpys.path,
                        type: compileType
                    },
                    npm: wpys.npm
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

            if (wpy.style && wpy.style.length) {
                tmp = cStyle.compile(wpy);

                if (!tmp) {
                    throw 'error';
                }
                tasks.push(tmp);
            }
        });

        return Promise.all(tasks);
    },

    copy (file) {
        let src = cache.getSrc();
        let dist = cache.getDist();
        let ext = cache.getExt();
        let config = util.getConfig();

        let opath = path.parse(file);

        switch (opath.ext) {
            case ext:
                break;
            case '.js':
                break;
            case '.html':
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
                        util.copy(path.parse(rst.file));
                    },
                    error (rst) {
                        util.warning(rst.err);
                        util.copy(path.parse(rst.file));
                    }
                });

        }
    }
}
