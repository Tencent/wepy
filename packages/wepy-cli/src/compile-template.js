/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */


import {DOMParser, DOMImplementation} from 'xmldom';
import path from 'path';
import util from './util';
import cache from './cache';
import cWpy from './compile-wpy';

import loader from './loader';

const PREFIX = '$';
const JOIN = '$';

const BOOLEAN_ATTRS = ['a:else', 'wx:else', 'show-info', 'active', 'controls', 'danmu-btn', 'enable-danmu', 'autoplay', 'disabled', 'show-value', 'checked', 'scroll-x', 'scroll-y', 'auto-focus', 'focus', 'auto-height', 'password', 'indicator-dots', 'report-submit', 'hidden', 'plain', 'loading', 'redirect', 'loop', 'controls'];

export default {
    comPrefix: {},
    comCount: 0,
    getPrefix (prefix) {
        if (!this.comPrefix[prefix]) {
            this.comPrefix[prefix] = util.camelize(prefix || '');
        }
        return this.comPrefix[prefix];
    },
    getTemplate (content) {
        content = `<template>${content}</template>`;
        content = util.attrReplace(content);
        let doc = new DOMImplementation().createDocument();
        let node = cWpy.createParser().parseFromString(content);
        let template = [].slice.call(node.childNodes || []).filter((n) => n.nodeName === 'template');

        [].slice.call(template[0].childNodes || []).forEach((n) => {
            doc.appendChild(n);
        });
        return doc;
    },

    isInQuote (str, n) {
        let firstIndex = str.search(/"|'/);
        if (firstIndex === -1 || firstIndex > n) return false;
        let char = '';
        let last = '';
        for (let i = 0; i < n; i++) {
            let c = str[i];
            if (c === '"' || c === '\'') {
                if (!char) {
                    char = c;
                } else if (char === c && last !== '\\') {
                    char = '';
                }
            }
            last = c;
        }
        return char !== '';
    },

    getFunctionInfo (str) {
        let rst = {name: '', params: []}, char = '', tmp = '', stack = [];
        for (let i = 0, len = str.length; i < len; i++) {
            char = str[i];
            if (!rst.name) {
                if (char === '(') {
                    rst.name = tmp;
                    tmp = '';
                    continue;
                }
            }
            if ((char === ',' || char === ')') && stack.length === 0) {
                let p = tmp.replace(/^\s*/ig, '').replace(/\s*$/ig, '');
                if (p && (p[0] === '"' || p[0] === '\'') && p[0] === p[p.length - 1]) {
                    p = p.substring(1, p.length - 1);
                }
                rst.params.push(p);
                tmp = '';
                continue;
            }
            if (char === '\'' || char === '"') {
                if (stack.length && stack[stack.length - 1] === char)
                    stack.pop();
                else
                    stack.push(char);
            }
            tmp += char;
        }
        return rst;
    },

    // 替换xmldom生成的无值属性
    replaceBooleanAttr(code) {
        let reg;
        BOOLEAN_ATTRS.forEach((v) => {
            reg = new RegExp(`${v}=['"]${v}['"]`, 'ig');
            code = code.replace(reg, v);
        })
        return code;
    },

    parseExp (content, prefix, ignores, mapping) {
        if (!prefix)
            return content;
        // replace {{ param ? 'abc' : 'efg' }} => {{ $prefix_param ? 'abc' : 'efg' }}
        return content.replace(/\{\{([^}]+)\}\}/ig, (matchs, words) => {
            return matchs.replace(/[^\.\w'"](\.{0}|\.{3})([a-z_\$][\w\d\._\$]*)/ig, (match, expand, word, n) => {
                //console.log(matchs + '------' + match + '--' + word + '--' + n);
                let char = match[0];
                let tmp = word.match(/^([\w\$]+)(.*)/);
                let w = tmp[1];
                let rest = tmp[2];
                if (ignores[w] || this.isInQuote(matchs, n)) {
                    return match;
                } else {
                    if (mapping.items && mapping.items[w] && mapping.items[w].bind) {
                        // prefix 减少一层
                        let upper = prefix.split(PREFIX);
                        upper.pop();
                        upper = upper.join(PREFIX);
                        upper = upper ? `${PREFIX}${upper}${JOIN}` : '';
                        return `${char}${expand}${upper}${mapping.items[w].mapping}${rest}`;
                    }
                    return `${char}${expand}${PREFIX}${prefix}${JOIN}${word}`;
                }
            });
        });
    },

    /**
     * Get :class expression
     * e.g. getClassExp('{"abc": num < 1}');
     */
    parseClassExp (exp) {
        exp = exp.replace(/^\s/ig, '').replace(/\s$/ig, '');
        if (exp[0] === '{' && exp[exp.length - 1] === '}') {
            exp = exp.substring(1, exp.length - 1);
            let i = 0, len = exp.length;
            let flagStack = [], flag = 'start';
            let classNames = [], result = {}, str = '';
            for (i = 0; i < len; i++) {
                if ((exp[i] === '\'' || exp[i] === '"')) {
                    if (flagStack.length && flagStack[0] === exp[i]) {
                        flagStack.pop();
                        if (flag === 'class') {
                            flag = ':';
                            continue;
                        } else if (flag === 'expression') {
                            str += exp[i];
                            continue;
                        }
                    } else {
                        if (flagStack.length === 0) {
                            flagStack.push(exp[i]);
                            if (flag === 'start') {
                                flag = 'class';
                                continue;
                            } else if (flag === 'expression') {
                                str += exp[i];
                                continue;
                            }
                        }
                    }
                }
                // {abc: num < 1} or {'abc': num <１}
                if (exp[i] === ':' && (flag === ':' || flag === 'class') && flagStack.length === 0) {
                    flag = 'expression';
                    classNames.push(str);
                    str = '';
                    continue;
                }
                if (exp[i] === ',' && flag === 'expression' && flagStack.length === 0) {
                    result[classNames[classNames.length - 1]] = str.replace(/^\s/ig, '').replace(/\s$/ig, '');;
                    str = '';
                    flag = 'start';
                    continue;
                }
                // get rid of the begining space
                if (!str.length && exp[i] === ' ')
                    continue;

                // not started with '', like {abc: num < 1}
                if (flag === 'start') {
                    flag = 'class';
                }

                if (flag === 'class' || flag === 'expression') {
                    str += exp[i];
                }
            }
            if (str.length) {
                result[classNames[classNames.length - 1]] = str.replace(/^\s/ig, '').replace(/\s$/ig, '');
            }
            return result;
        } else {
            throw ':class expression is not correct, it has to be {\'className\': mycondition}';
        }
    },


    // 通过mapping一层层映射，反应到属性上
    getMappingIndex (mapping, arr) {
        if (!arr)
            arr = [];

        if (mapping === null)
            return arr.reverse();

        let val = mapping.prefix ? `${PREFIX}${mapping.prefix}${JOIN}${mapping.for.index}` : mapping.for.index;
        arr.push(`{{${val}}}`);
        return this.getMappingIndex(mapping.parent, arr);
    },

    /**
     * 组件图片引用会被直接编译进页面，因此需要对组件中的相对路径进行路径修正
     */
    fixRelativePath (node, template, parentTemplate) {
        if (node.nodeName === 'image' && parentTemplate) {
            let src = node.getAttribute('src')
            if (src[0] === '.') {
                let realpath = path.join(path.parse(template.src).dir, node.getAttribute('src'));
                let fixedpath = path.relative(path.parse(parentTemplate.src).dir, realpath);
                fixedpath = fixedpath.replace(/\\/g, '/');
                node.setAttribute('src', fixedpath);
            }
        }
        return node;
    },

    updateBind (node, template, parentTemplate, prefix, ignores = {}, mapping = {}) {
        //include模板：include进来的模板实际为直接复制合并到当前文件，使用当前文件的作用域，这不同于具有独立作用域的WePY组件模板
        //与小程序原生import模板。
        //这与小程序原生include模板功能类似，但也有明显区别：
        //    1）原生include只是“相当于”复制合并到当前文件，而这里的include是实际会复制合并到当前文件的，这使得使用wepy语法的模板能
        //       被wepy编译；
        //    2）同时这也使得复制合并过来的wepy模板能够参与当前文件作用域，这对于在wepy组件模板部分中include模板很有用。
        //
        // 语法：<include src="../relative/path/to/template.wpy" />
        //
        // 注意：
        //    1）与小程序原生include的区别在于src中的文件后缀为.wpy，因此文件后缀名不能省略，否则在wepy编译时将不会被复制合并；
        //    2）template.wpy模板文件顶层只能含有template标签，不能含有script标签和style标签，否则可能会引发不可知的异常；
        //    3）template.wpy模板文件中不能再嵌套wepy组件，否则可能会引发不可知的异常。
        [].slice.call(node.childNodes || []).forEach(function (child) {
            if (child.tagName === 'include' && /\.wpy$/.test(child.getAttribute('src'))) {
                let childSrcResolved = path.resolve(template.src, '..' + path.sep + child.getAttribute('src'));
                if (childSrcResolved) {
                    cache.setFileNotWritten(childSrcResolved);
                    let content = util.attrReplace(util.readFile(childSrcResolved).replace(/^\s*<template[^>]*>|<\/template>\s*$/ig, ''));
                    node.replaceChild(cWpy.createParser().parseFromString(content), child);
                    //console.log('成功include模板：' + childSrcResolved)
                } else {
                    //console.log('include模板前src路径解析错误，src路径为：', child.getAttribute('src'));
                }
            }
        });

        let config = cache.getConfig();
        let tagprefix = config.output === 'ant' ? 'a' : 'wx';

        node = this.fixRelativePath(node, template, parentTemplate);

        if (node.nodeName === '#text' && prefix) {
            if (node.data && node.data.indexOf('{{') > -1) {
                node.replaceData(0, node.data.length, this.parseExp(node.data, prefix, ignores, mapping));
            }
        } else {
            [].slice.call(node.attributes || []).forEach((attr) => {
                if (attr.name === 'v-bind:class.once') {
                    let classObject = this.parseClassExp(attr.value);
                    let classArray = (node.getAttribute('class') || '').split(' ').map(v => v.replace(/^\s/ig, '').replace(/\s$/ig, ''));
                    if (classArray.length === 1 && classArray[0] === '')
                        classArray = [];
                    for (let k in classObject) {
                        let exp = classObject[k].replace(/\'/ig, '\\\'').replace(/\"/ig, '\\"');
                        let name = k.replace(/\'/ig, '\\\'').replace(/\"/ig, '\\"');
                        let index = classArray.indexOf(name);
                        if (index !== -1) {
                            classArray.splice(index, 1);
                        }
                        exp = `{{${exp} ? '${name}' : ''}}`;
                        classArray.push(this.parseExp(exp, prefix, ignores, mapping));
                    }
                    node.setAttribute('class', classArray.join(' '));
                    node.removeAttribute(attr.name);
                }
                if (prefix) {
                    if (attr.value.indexOf('{{') > -1) {
                        attr.value = this.parseExp(attr.value, prefix, ignores, mapping);
                    }
                    if (attr.name === tagprefix + ':for' || attr.name === tagprefix + ':for-items') {
                        let index = node.getAttribute(tagprefix + ':for-index') || 'index';
                        let item = node.getAttribute(tagprefix + ':for-item') || 'item';
                        ignores[index] = true;
                        ignores[item] = true;
                        //attr.value = parseExp(attr.value, prefix, ignores);
                    }
                }
                // bindtap="abc" => bindtap="prefix_abc"
                if (
                    (config.output !== 'ant' && (attr.name.indexOf('bind') === 0 || attr.name.indexOf('catch') === 0)) ||
                    (config.output === 'ant' && (attr.name.indexOf('on') === 0 || attr.name.indexOf('catch') === 0))
                    ) {
                    // added index for all events;
                    if (mapping.items && mapping.items.length > 0) {
                        // prefix 减少一层
                        let upper = prefix.split(PREFIX);
                        upper.pop();
                        upper = upper.join(PREFIX);
                        upper = upper ? `${PREFIX}${upper}${JOIN}` : '';
                        let comIndex = this.getMappingIndex(mapping);
                        node.setAttribute('data-com-index', comIndex.join('-'));
                    }
                    if (attr.value.indexOf('(') > 0) {  // method('{{p}}', 123);
                        let funcInfo = this.getFunctionInfo(attr.value);
                        attr.value = funcInfo.name;
                        funcInfo.params.forEach((p, i) => {
                            node.setAttribute('data-wpy' + funcInfo.name.toLowerCase() + '-' + String.fromCharCode(97 + i), p);
                        });
                    }
                    if (prefix)
                        attr.value = `${PREFIX}${prefix}${JOIN}` + attr.value;
                }
                if (attr.name === 'a:for-items' && config.output === 'ant') {
                    node.setAttribute('a:for', attr.value);
                    node.removeAttribute(attr.name);
                }
            });
            [].slice.call(node.childNodes || []).forEach((child) => {
                this.updateBind(child, template, parentTemplate, prefix, ignores, mapping);
            });
        }
        return node;
    },

    updateSlot (node, childNodes) {
        let slots = {}, has;
        if (!childNodes || childNodes.length === 0)
            slots = {};
        else {
            [].slice.call(childNodes || []).forEach((child) => {
                let name = (child.nodeName === '#text' || child.nodeName === '#comment') ? '' : child.getAttribute('slot');

                if (!name) {
                    name = '$$default';
                }
                if (slots[name])
                    slots[name].push(child);
                else
                    slots[name] = [child];
            });
        }

        let slotsElems = util.elemToArray(node.getElementsByTagName('slot'));

        slotsElems.forEach((slot) => {
            let name = slot.getAttribute('name');
            if (!name)
                name = '$$default';

            // 无内容时，用子内容替换
            let replacements = (slots[name] && slots[name].length > 0) ? slots[name] : [].slice.call(slot.childNodes || []);

            let doc = new DOMImplementation().createDocument();
            replacements.forEach((n) => {
                if (name !== '$$default' && n.nodeName !== '#text' && n.nodeName !== '#comment')
                    n.removeAttribute('slot');
                doc.appendChild(n);
            });

            node.replaceChild(doc, slot);
        });
        return node;
    },

    compileXML (node, template, parentTemplate, prefix, childNodes, comAppendAttribute = {}, propsMapping = {}) {
        let config = cache.getConfig();
        let tagprefix = config.output === 'ant' ? 'a' : 'wx';
        this.updateSlot(node, childNodes);

        this.updateBind(node, template, parentTemplate, prefix, {}, propsMapping);

        if (node && node.documentElement) {
            Object.keys(comAppendAttribute).forEach((key) => {
                if (key === 'class') {
                    let classNames = node.documentElement.getAttribute('class').split(' ').concat(comAppendAttribute[key].split(' ')).join(' ');
                    node.documentElement.setAttribute('class', classNames);
                } else {
                    node.documentElement.setAttribute(key, comAppendAttribute[key]);
                }
            });
        }

        let repeats = util.elemToArray(node.getElementsByTagName('repeat'));

        let forDetail = {};
        template.props = {};
        repeats.forEach(repeat => {
            let repeatComs = [];
            // <repeat for="xxx" index="idx" item="xxx" key="xxx"></repeat>
            //                    To
            // <block wx:for="xxx" wx:for-index="xxx" wx:for-item="xxx" wx:key="xxxx"></block>
            repeat.tagName = 'block';
            let val = repeat.getAttribute('for');
            if (val) {
                repeat.setAttribute(tagprefix + ':for', val);
                repeat.removeAttribute('for');
                ['index', 'item', 'key'].forEach(attr => {
                    let val = repeat.getAttribute(attr);
                    let tag = attr === 'key' ? `${tagprefix}:key` : `${tagprefix}:for-${attr}`;
                    val = val || attr;
                    forDetail[attr] = val;
                    if (prefix) {
                        repeat.setAttribute(tag, `${PREFIX}${prefix}${JOIN}${val}`);
                    } else {
                        repeat.setAttribute(tag, val);
                    }
                    repeat.removeAttribute(attr);
                });
            }
            Object.keys(template.components).forEach((com) => {
                repeatComs = repeatComs.concat(util.elemToArray(repeat.getElementsByTagName(com)));
            });
            repeatComs.forEach(com => {
                let comAttributes = {};
                template.props[com.tagName] = {
                    items: {length: 0},
                    for: forDetail,
                    prefix: prefix,
                    parent: propsMapping.for ? propsMapping : null
                };
                [].slice.call(com.attributes || []).forEach(attr => {

                    if (['hidden', 'wx:if', 'wx:elif', 'wx:else', 'class', 'a:if', 'a:elif', 'a:else'].indexOf(attr.name) > -1) {
                        comAttributes[attr.name] = attr.value;
                    }
                    let name = attr.name;

                    let prop = template.props[com.tagName], tmp = {};


                    if (name.indexOf('v-bind') === 0) {
                        tmp.bind = true;
                        name = name.replace(/^v\-bind\:/, '');
                    }

                    if (name.indexOf('.once') === name.length - 5) {
                        name = name.replace(/\.once$/, '');
                        tmp.type = 'once';
                    } else if (name.indexOf('.sync') === name.length - 5) {
                        tmp.type = 'sync';
                        name = name.replace(/\.sync$/, '');
                    }
                    tmp.mapping = attr.value;

                    prop.items[name] = tmp;
                    prop.items.length++;
                });

                let comid = util.getComId(com);
                let src = util.findComponentInTemplate(com, template);
                if (!src) {
                    util.error('找不到组件：' + com.tagName, '\n请尝试使用 npm install ' + com.tagName + ' 安装', '错误');
                } else {
                    let comWpy = cWpy.resolveWpy(src);
                    let newnode = this.compileXML(this.getTemplate(comWpy.template.code), comWpy.template, template, this.getPrefix(prefix ? `${prefix}$${comid}` : `${comid}`), com.childNodes, comAttributes, template.props[comid]);
                    node.replaceChild(newnode, com);
                }
            });
        });

        let componentElements = util.elemToArray(node.getElementsByTagName('component'));
        let customElements = [];
        Object.keys(template.components).forEach((com) => {
            customElements = customElements.concat(util.elemToArray(node.getElementsByTagName(com)));
        });

        componentElements = componentElements.concat(customElements);

        componentElements.forEach((com) => {
            let comid, definePath, isCustom = false, comAttributes = {};
            [].slice.call(com.attributes || []).forEach((attr) => {
                if (['hidden', tagprefix + ':if', tagprefix + ':elif', tagprefix + ':else', 'class'].indexOf(attr.name) > -1) {
                    comAttributes[attr.name] = attr.value;
                }
            });
            if (com.nodeName === 'component') {
                comid = util.getComId(com);
                definePath = util.getComPath(com);
                if (!comid)
                    throw new Error('Unknow component id');
            } else {
                isCustom = true;
                comid = util.getComId(com);
                definePath = template.components[comid];
                definePath = definePath.indexOf('.') === -1 ? definePath : path.resolve(template.src, '..' + path.sep + template.components[comid])
            }

            let src = util.findComponent(definePath, isCustom);
            if (!src) {
                util.error('找不到组件：' + definePath, '\n请尝试使用 npm install ' + definePath + ' 安装', '错误');
            } else {
                let comWpy = cWpy.resolveWpy(src);
                let newnode = this.compileXML(this.getTemplate(comWpy.template.code), comWpy.template, template, this.getPrefix(prefix ? `${prefix}$${comid}` : `${comid}`), com.childNodes, comAttributes);

                node.replaceChild(newnode, com);
            }
        });
        return node;
    },

    compile (template) {
        let lang = template.type;
        let content = util.attrReplace(template.code);

        let config = util.getConfig();
        let src = cache.getSrc();
        let dist = cache.getDist();
        let self = this;

        let compiler = loader.loadCompiler(lang);

        if (!compiler) {
            return;
        }

        if (lang === 'pug') { // fix indent for pug, https://github.com/wepyjs/wepy/issues/211
            let indent = util.getIndent(content);
            if (indent.firstLineIndent) {
                content = util.fixIndent(content, indent.firstLineIndent * -1, indent.char);
            }
        }

        compiler(content, config.compilers[lang] || {}).then(content => {
            let opath = path.parse(template.src);
            let node = cWpy.createParser(opath).parseFromString(content);
            node = this.compileXML(node, template);
            opath.npm = template.npm;
            let target = util.getDistPath(opath, config.output === 'ant' ? 'axml' : 'wxml', src, dist);

            if (node.childNodes.length === 0) {
                // empty node tostring will cause an error.
                node = '';
            } else {
                // https://github.com/jindw/xmldom/blob/master/dom.js#L585
                // https://github.com/jindw/xmldom/blob/master/dom.js#L919
                // if childNode is only one Text, then will get an error in doc.toString
                if (node.documentElement === null && node.nodeType === 9) {
                    node.nodeType = 11;
                }
                // xmldom will auto generate something like xmlns:wx.
                node = node.toString().replace(/xmlns[^\s>]*/g, '');
            }

            let plg = new loader.PluginHelper(config.plugins, {
                type: 'wxml',
                code: util.decode(node.toString()),
                file: target,
                output (p) {
                    util.output(p.action, p.file);
                },
                done (rst) {
                    if (cache.getFileNotWritten(opath.dir + path.sep + opath.base) > -1) return;

                    util.output('写入', rst.file);
                    rst.code = self.replaceBooleanAttr(rst.code);
                    util.writeFile(target, rst.code);
                }
            });
        }).catch((e) => {
            console.log(e);
        });
        //util.log('WXML: ' + path.relative(process.cwd(), target), '写入');
        //util.writeFile(target, util.decode(node.toString()));
    }
}
