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
    createParser () {
        return new DOMParser({errorHandler: {
            warning (x) {
                if (x.indexOf('missed value!!') > -1) {
                    // ignore warnings
                } else
                    util.warning(x);
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
        let content = util.readFile(filepath);

        if (content === null) {
            util.error('打开文件失败: ' + filepath)
            return;
        }
        let startlen = content.indexOf('<script') + 7;
        while(content[startlen++] !== '>') {
            // do nothing;
        }
        content = util.encode(content, startlen, content.indexOf('</script>') - 1);

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

        content = util.attrReplace(content);

        xml = this.createParser().parseFromString(content);

        const moduleId = simpleId(filepath);

        let rst = {
            moduleId: moduleId,
            style: {
                code: '',
                scoped: ''
            },
            template: {
                code: ''
            },
            script: {
                code: ''
            }
        };

        [].slice.call(xml.childNodes || []).forEach((child) => {
            const nodeName = child.nodeName;
            if (nodeName === 'style' || nodeName === 'template' || nodeName === 'script') {
                const rstTypeObj = rst[nodeName];
                rstTypeObj.src = child.getAttribute('src');
                rstTypeObj.type = child.getAttribute('lang') || child.getAttribute('type');
                if (nodeName === 'style') {
                    // 针对于 style 增加是否包含 scoped 属性
                    rstTypeObj.scoped = child.getAttribute('scoped');
                }

                if (rstTypeObj.src) {
                    rstTypeObj.src = path.resolve(opath.dir, rstTypeObj.src);
                }

                if (rstTypeObj.src && util.isFile(rstTypeObj.src)) {
                    rstTypeObj.code = util.readFile(rstTypeObj.src, 'utf-8');
                    if (rstTypeObj.code === null) {
                        throw '打开文件失败: ' + rstTypeObj.src;
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
        rst.style.type = rst.style.type || 'css';
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
                    rst.template.code = compiler.sync(rst.template.code, config.compilers[rst.template.type] || {});
                    rst.template.type = 'wxml';
                }
            }
        })();

        // get imports
        (() => {
            let coms = {};
            rst.script.code.replace(/import\s*([\w\-\_]*)\s*from\s*['"]([\w\-\_\.\/]*)['"]/ig, (match, com, path) => {
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
            let coms = Object.keys(rst.template.components);
            let elems = [];
            let props = {};
            let events = {};

            let calculatedComs = [];

            // Get components in repeat
            util.elemToArray(xml.getElementsByTagName('repeat')).forEach(repeat => {
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
                                        props[comid][attr.name] = tmp;
                                        props[comid][attr.name]['value'] = attr.value;
                                    }
                                }
                            }
                        });
                    });
                }
            });

            elems = [];
            coms.concat('component').forEach((com) => {
                elems = elems.concat(util.elemToArray(xml.getElementsByTagName(com)));
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
                    return `$props = ${JSON.stringify(props)};\r\n$events = ${JSON.stringify(events)};\r\n${match}`;
                });
            }
        })();

        if (rst.style.scoped && rst.template.code) {
            // scoped 更新 template.code
            var node = this.createParser().parseFromString(rst.template.code);
            walkNode(node, rst.moduleId);
            // 更新 template.code
            rst.template.code = node.toString();
        }

        return rst;
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
        if (!/^node_modules/.test(path.relative(util.currentDir, filepath))) {
            this.lint(filepath);
        }

        let wpy = this.resolveWpy(opath);

        if (type === 'app') { // 第一个编译
            cache.setPages(wpy.config.pages.map(v => path.join(src, v + wpyExt)));
        }

        if (wpy.config) {
            cConfig.compile(wpy.config, opath);
        } else {
            this.remove(opath, 'json');
        }
        if (wpy.style.code || Object.keys(wpy.template.components).length) {
            let requires = [];
            let k, tmp;
            for (k in wpy.template.components) {
                tmp = wpy.template.components[k];
                if (tmp.indexOf('.') === -1) {
                    requires.push(tmp); // 第三方组件
                } else {
                    requires.push(path.join(opath.dir, wpy.template.components[k]));
                }
            }
            if (type === 'app') {
                // 如果是 app 没有 wxml 所以这里不能做替换
                // 强制 scoped = '' 也就是在 app.wpy 中
                // 设置 scoped 无效
                wpy.style.scoped = '';
            }
            cStyle.compile(wpy.style.type, wpy.style.code, wpy.style.scoped, requires, opath, wpy.moduleId);
        } else {
            this.remove(opath, 'wxss');
        }

        if (wpy.template.code && (type !== 'app' && type !== 'component')) { // App 和 Component 不编译 wxml
            //cTemplate.compile(wpy.template.type, wpy.template.code, opath);
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

const ID_MAP = {};
let ID_BASE = 1;
const simpleId = function (filepath) {
    if (!ID_MAP[filepath]) {
        ID_MAP[filepath] = 'wepy-css-' + ID_BASE++;
    }
    return ID_MAP[filepath];
}
