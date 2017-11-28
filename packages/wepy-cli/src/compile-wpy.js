/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * 
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import path from 'path';
import fs from 'fs';
import {DOMParser} from 'xmldom';
import eslint from './eslint';
import cache from './cache';
import util from './util';

import cConfig from './compile-config';
/*import cLess from './compile-less';
import cSass from './compile-sass';
import cCss from './compile-css';*/
import cStyle from './compile-style';
import cTemplate from './compile-template';
import cScript from './compile-script';
import toWeb from './web/index';
import loader from './loader';

export default {
    _cacheWpys: {},
    createParser (opath) {
        return new DOMParser({errorHandler: {
            warning (x) {
                if (x.indexOf('missed value!!') > -1) {
                    // ignore warnings
                } else {
                    util.warning('WARNING IN : ' + path.relative(util.currentDir, path.join(opath.dir, opath.base)) + '\n' + x);
                }
            },
            error (x) {
                util.error('ERROR IN : ' + path.relative(util.currentDir, path.join(opath.dir, opath.base)) + '\n' + x);
            }
        }});
    },

    grabConfigFromScript(str, n) {
        let stash = [], rst = '';
        for (let i = n, l = str.length; i < l; i++) {
            if (str[i] === '{')
                stash.push('{');
            if (str[i] === '}') {
                stash.pop();
                if (stash.length === 0) {
                    rst += '}';
                    break;
                }
            }
            if (stash.length) {
                rst += str[i];
            }
        }
        return rst;
    },
    /*
    Use components instead, unused functions
     */
    resolveRelation (xml) {
        let requires = [];
        let matchs = xml.match(/<component[^/>]*\/>/ig);

        (matchs || []).forEach(function (m) {
            let rst;
            if (m.indexOf('path') > -1) {
                rst = m.match(/path\s*=\s*['"](.*)['"]/);
            } else {
                rst = m.match(/id\s*=\s*['"](.*)['"]/);
            }
            if (rst[1] && requires.indexOf(rst[1]) === -1)
                requires.push(rst[1]);
        });
        return requires;
    },

    resolveWpy (xml, opath) {
        let config = util.getConfig();
        let filepath;

        if (typeof(xml) === 'object' && xml.dir) {
            opath = xml;
            filepath = path.join(xml.dir, xml.base);
        } else {
            opath = path.parse(xml);
            filepath = xml;
        }
        filepath = path.resolve(filepath); // to fixed windows path bug
        let content = util.readFile(filepath);


        const moduleId = util.genId(filepath);

        let rst = {
            moduleId: moduleId,
            style: [],
            template: {
                code: '',
                src: '',
                type: ''
            },
            script: {
                code: '',
                src: '',
                type: ''
            }
        };

        if (content === null) {
            util.error('打开文件失败: ' + filepath);
            return rst;
        }
        if (content === '') {
            util.warning('发现空文件: ' + filepath);
            return rst;
        }

        let startlen = content.indexOf('<script') + 7;
        if (startlen >= 7 && content.length >= 8) { // this is no scripts
            while(content[startlen++] !== '>') {
                // do nothing;
            }
            content = util.encode(content, startlen, content.indexOf('</script>') - 1);
        }
        // replace :attr to v-bind:attr
        /*content = content.replace(/<[\w-\_]*\s[^>]*>/ig, (tag) => {
            return tag.replace(/\s+:([\w-_]*)([\.\w]*)\s*=/ig, (attr, name, type) => { // replace :param.sync => v-bind:param.sync
                if (type === '.once' || type === '.sync') {
                }
                else
                    type = '.once';
                return ` v-bind:${name}${type}=`;
            }).replace(/\s+\@([\w-_]*)\s*=/ig, (attr, name) => { // replace @change => v-on:change
                return `v-on:${name}`;
            });
        })*/

        if (content.indexOf('<template') !== -1) {
            content = util.attrReplace(content);
        }

        xml = this.createParser(opath).parseFromString(content);

        [].slice.call(xml.childNodes || []).forEach((child) => {
            const nodeName = child.nodeName;
            if (nodeName === 'style' || nodeName === 'template' || nodeName === 'script') {
                let rstTypeObj;

                if (nodeName === 'style') {
                    rstTypeObj = {code: ''};
                    rst[nodeName].push(rstTypeObj);
                } else {
                    rstTypeObj = rst[nodeName];
                }

                rstTypeObj.src = child.getAttribute('src');
                rstTypeObj.type = child.getAttribute('lang') || child.getAttribute('type');
                if (nodeName === 'style') {
                    // 针对于 style 增加是否包含 scoped 属性
                    rstTypeObj.scoped = child.getAttribute('scoped') ? true : false;
                }

                if (rstTypeObj.src) {
                    rstTypeObj.src = path.resolve(opath.dir, rstTypeObj.src);
                    rstTypeObj.link = true;
                } else {
                    rstTypeObj.link = false;
                }

                if (rstTypeObj.src && util.isFile(rstTypeObj.src)) {
                    const fileCode = util.readFile(rstTypeObj.src, 'utf-8');
                    if (fileCode === null) {
                        throw '打开文件失败: ' + rstTypeObj.src;
                    } else {
                        rstTypeObj.code += fileCode;
                    }
                } else {
                    [].slice.call(child.childNodes || []).forEach((c) => {
                        rstTypeObj.code += util.decode(c.toString());
                    });
                }

                if (!rstTypeObj.src)
                    rstTypeObj.src = path.join(opath.dir, opath.name + opath.ext);
            }
        });

        /*
        Use components instead
        if (rst.template.code) {
            rst.template.requires = this.resolveRelation(rst.template.code);
        }*/

        // default type
        rst.template.type = rst.template.type || 'wxml';
        rst.script.type = rst.script.type || 'babel';

        // get config
        (() => {
            let match = rst.script.code.match(/[\s\r\n]config\s*=[\s\r\n]*/);
            match = match ? match[0] : undefined;

            rst.config = match ? this.grabConfigFromScript(rst.script.code, rst.script.code.indexOf(match) + match.length) : false;
            try {
                if (rst.config) {
                    rst.config = new Function(`return ${rst.config}`)();
                }
            } catch (e) {
                util.output('错误', path.join(opath.dir, opath.base));
                util.error(`解析config出错，报错信息：${e}\r\n${rst.config}`);
            }
        })();

        // pre compile wxml
        (() => {
            if (rst.template.type !== 'wxml' && rst.template.type !== 'xml') {
                let compiler = loader.loadCompiler(rst.template.type);
                if (compiler && compiler.sync) {
                    if (rst.template.type === 'pug') { // fix indent for pug, https://github.com/wepyjs/wepy/issues/211
                        let indent = util.getIndent(rst.template.code);
                        if (indent.firstLineIndent) {
                            rst.template.code = util.fixIndent(rst.template.code, indent.firstLineIndent * -1, indent.char);
                        }
                    }
                    let compilerConfig = config.compilers[rst.template.type];

                    // xmldom replaceNode have some issues when parsing pug minify html, so if it's not set, then default to un-minify html.
                    if (compilerConfig.pretty === undefined) {
                        compilerConfig.pretty = true;
                    }
                    rst.template.code = compiler.sync(rst.template.code, config.compilers[rst.template.type] || {});
                    rst.template.type = 'wxml';
                }
            }
            if (rst.template.code)
                rst.template.node = this.createParser(opath).parseFromString(util.attrReplace(rst.template.code));
        })();

        // get imports
        (() => {
            let coms = {};
            rst.script.code.replace(/import\s*([\w\-\_]*)\s*from\s*['"]([\w\-\_\.\/\@]*)['"]/ig, (match, com, path) => {
                coms[com] = path;
            });

            let match = rst.script.code.match(/[\s\r\n]components\s*=[\s\r\n]*/);
            match = match ? match[0] : undefined;
            let components = match ? this.grabConfigFromScript(rst.script.code, rst.script.code.indexOf(match) + match.length) : false;
            let vars = Object.keys(coms).map((com, i) => `var ${com} = "${coms[com]}";`).join('\r\n');
            try {
                if (components) {
                    rst.template.components = new Function(`${vars}\r\nreturn ${components}`)();
                } else {
                    rst.template.components = {};
                }
            } catch (e) {
                util.output('错误', path.join(opath.dir, opath.base));
                util.error(`解析components出错，报错信息：${e}\r\n${vars}\r\nreturn ${components}`);
            }
        })();


        // get props and events
        (() => {
            if (!rst.template.node)
                return;
            let coms = Object.keys(rst.template.components);
            let elems = [];
            let props = {};
            let events = {};
            let $repeat = {};

            let repeatItem = '';

            let calculatedComs = [];

            // Get components in repeat
            util.elemToArray(rst.template.node.getElementsByTagName('repeat')).forEach(repeat => {
                elems = [];
                if (repeat.getAttribute('for')) {
                    let tmp = {
                        for: repeat.getAttribute('for').replace(/^\s*\{\{\s*/, '').replace(/\s*\}\}\s*$/, ''),
                        item: repeat.getAttribute('item') || 'item',
                        index: repeat.getAttribute('index') || 'index',
                        key: repeat.getAttribute('key') || 'key',
                    }
                    coms.concat('component').forEach((com) => {
                        elems = elems.concat(util.elemToArray(repeat.getElementsByTagName(com)));
                    });

                    elems.forEach((elem) => {
                        calculatedComs.push(elem);
                        let comid = util.getComId(elem);
                        let forexp = tmp.for;
                        if (forexp.indexOf('.') > -1) {  // for="{{mydata.list}}"
                            forexp = forexp.split('.')[0];
                        }
                        $repeat[forexp] = { com: comid };
                        [].slice.call(elem.attributes || []).forEach((attr) => {
                            if (attr.name !== 'xmlns:v-bind=""') {
                                if (attr.name !== 'id' && attr.name !== 'path') {
                                    if (/v-on:/.test(attr.name)) { // v-on:fn user custom event
                                        if (!events[comid])
                                            events[comid] = {};
                                        events[comid][attr.name] = attr.value;
                                    } else {
                                        if (!props[comid])
                                            props[comid] = {};
                                        if (['hidden', 'wx:if', 'wx:elif', 'wx:else'].indexOf(attr.name) === -1) {
                                            let assign = { value: attr.value };
                                            switch (assign.value) {
                                                case tmp.item:
                                                    assign.type = 'item';
                                                    repeatItem = attr.name.replace('v-bind:', '').replace('.once', '');
                                                    break;
                                                case tmp.index:
                                                    assign.type = 'index';
                                                    break;
                                                case tmp.key:
                                                    assign.type = 'key';
                                                    break;
                                            }
                                            props[comid][attr.name] = Object.assign(assign, tmp);
                                        }
                                    }
                                }
                            }
                        });

                        $repeat[forexp].props = repeatItem;
                    });
                }
            });

            elems = [];
            coms.concat('component').forEach((com) => {
                elems = elems.concat(util.elemToArray(rst.template.node.getElementsByTagName(com)));
            });

            elems.forEach((elem) => {
                // ignore the components calculated in repeat.
                if (calculatedComs.indexOf(elem) === -1) {
                    let comid = util.getComId(elem);
                    [].slice.call(elem.attributes || []).forEach((attr) => {
                        if (attr.name !== 'id' && attr.name !== 'path') {
                            if (/v-on:/.test(attr.name)) { // v-on:fn user custom event
                                if (!events[comid])
                                    events[comid] = {};
                                events[comid][attr.name] = attr.value;
                            } else {
                                if (!props[comid])
                                    props[comid] = {};
                                if (['hidden', 'wx:if', 'wx:elif', 'wx:else'].indexOf(attr.name) === -1) {
                                    props[comid][attr.name] = attr.value;
                                }
                            }
                        }
                    });
                }
            });
            if (Object.keys(props).length) {
                rst.script.code =rst.script.code.replace(/[\s\r\n]components\s*=[\s\r\n]*/, (match, item, index) => {
                    return `$repeat = ${JSON.stringify($repeat)};\r\n$props = ${JSON.stringify(props)};\r\n$events = ${JSON.stringify(events)};\r\n${match}`;
                });
            }
        })();

        if (rst.style.some(v => v.scoped) && rst.template.code) {
            // 存在有 scoped 部分就需要 更新 template.code
            var node = this.createParser(opath).parseFromString(rst.template.code);
            walkNode(node, rst.moduleId);
            // 更新 template.code
            rst.template.code = node.toString();
        }
        this._cacheWpys[filepath] = rst;
        return this._cacheWpys[filepath];
        // return rst;
    },

    remove (opath, ext) {
        let src = cache.getSrc();
        let dist = cache.getDist();
        ext = ext || opath.substr(1);
        let target = util.getDistPath(opath, ext, src, dist);
        if (util.isFile(target)) {
            util.log('配置: ' + path.relative(util.currentDir, target), '删除');
            fs.unlinkSync(target);
        }
    },

    lint (filepath) {
        eslint(filepath);
    },

    compile (opath) {
        let filepath = path.join(opath.dir, opath.base);
        let src = cache.getSrc();
        let dist = cache.getDist();
        let wpyExt = cache.getExt();
        let pages = cache.getPages();

        let type = '';
        let relative = path.relative(util.currentDir, filepath);

        if (filepath === path.join(util.currentDir, src, 'app' + wpyExt)) {
            type = 'app';
            util.log('入口: ' + relative, '编译');
        } else if (pages.indexOf(relative) > -1) {
            type = 'page';
            util.log('页面: ' + relative, '编译');
        } else if (relative.indexOf(path.sep + 'components' + path.sep) > -1){
            type = 'component';
            util.log('组件: ' + relative, '编译');
        } else {
            util.log('Other: ' + relative, '编译');
        }

        // Ignore all node modules, avoid eslint warning.
        // https://github.com/eslint/eslint/blob/75b7ba4113db4d9bc1661a4600c8728cf3bfbf2b/lib/cli-engine.js#L325
        if (!opath.npm) {
            this.lint(filepath);
        }

        let wpy = this.resolveWpy(opath);

        if (!wpy) {
            return;
        }

        if (type === 'app') { // 第一个编译
            cache.setPages(wpy.config.pages.map(v => path.join(src, v + wpyExt)));

            // scoped 设置无效
            wpy.style.forEach(rst => rst.scoped = false);

            // 无template
            delete wpy.template;

        } else if (type === 'component') {
            delete wpy.config;
        }

        if (wpy.config) {
            cConfig.compile(wpy.config, opath);
        } else {
            this.remove(opath, 'json');
        }

        if (wpy.style.length || (wpy.template  && wpy.template.components && Object.keys(wpy.template.components).length)) {
            let requires = [];
            let k, tmp;
            if (wpy.template) {
                for (k in wpy.template.components) {
                    tmp = wpy.template.components[k];
                    if (tmp.indexOf('.') === -1) {
                        requires.push(tmp); // 第三方组件
                    } else {
                        requires.push(path.join(opath.dir, wpy.template.components[k]));
                    }
                }
            }
            try {
                cStyle.compile(wpy.style, requires, opath, wpy.moduleId);
            } catch (e) {
                util.error(e);
            }
        } else {
            this.remove(opath, 'wxss');
        }

        if (wpy.template && wpy.template.code && type !== 'component') { // App 和 Component 不编译 wxml
            //cTemplate.compile(wpy.template.type, wpy.template.code, opath);
            wpy.template.npm = opath.npm;
            cTemplate.compile(wpy.template);
        }

        if (wpy.script.code) {
            cScript.compile(wpy.script.type, wpy.script.code, type, opath);
        }
    }
};

function walkNode (node, moduleId) {
    if (node.childNodes) {
        [].slice.call(node.childNodes || []).forEach((child) => {
            if (child.tagName) {
                // 是标签 则增加class
                const cls = child.getAttribute('class');
                child.setAttribute('class', (cls + ' ' + moduleId).trim());
                walkNode(child, moduleId);
            }
        });
    }
}
