import {DOMParser, DOMImplementation} from 'xmldom';
import path from 'path';
import util from './util';
import cache from './cache';
import cWpy from './compile-wpy';

import loader from './loader';

const PREFIX = '$';
const JOIN = '$';

const BOOLEAN_ATTRS = ['wx:else', 'show-info', 'active', 'controls', 'danmu-btn', 'enable-danmu', 'autoplay', 'disabled', 'show-value', 'checked', 'scroll-x', 'scroll-y', 'auto-focus', 'focus', 'auto-height', 'password', 'indicator-dots', 'report-submit', 'hidden', 'plain', 'loading', 'redirect', 'loop', 'controls'];

export default {
    comPrefix: {},
    comCount: 0,
    getPrefix (prefix) {
        return prefix;
        if (this.comPrefix[prefix])
            return this.comPrefix[prefix];
        this.comPrefix[prefix] = this.comCount++;
        return this.comPrefix[prefix];
    },
    getTemplate (content) {
        content = `<template>${content}</template>`;
        content = content.replace(/<[\w-\_]*\s[^>]*>/ig, (tag) => {
            return tag.replace(/\s+:([\w-_]*)([\.\w]*)\s*=/ig, (attr, name, type) => {
                if (type === '.once' || type === '.sync') {
                }
                else
                    type = '.once';
                return ` v-bind:${name}${type}=`;
            });
        });

        let doc = new DOMImplementation().createDocument();
        let node = new DOMParser().parseFromString(content);
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

    parseExp (content, prefix, ignores) {
        let comid = this.getPrefix(prefix);
        // replace {{ param ? 'abc' : 'efg' }} => {{ $prefix_param ? 'abc' : 'efg' }}
        return content.replace(/\{\{([^}]+)\}\}/ig, (matchs, words) => {
            return matchs.replace(/[^\.\w'"]([a-z_\$][\w\d\._\$]*)/ig, (match, word, n) => {
                //console.log(matchs + '------' + match + '--' + word + '--' + n);
                let char = match[0];
                let w = word.match(/^\w+/)[0];
                if (ignores[w] || this.isInQuote(matchs, n)) {
                    return match;
                } else {
                    return `${char}${PREFIX}${comid}${JOIN}${word}`;
                }
            });
        });
    },


    updateBind (node, prefix, ignores = {}) {

        let comid = prefix ? this.getPrefix(prefix) : '';

        if (node.nodeName === '#text' && prefix) {
            if (node.data && node.data.indexOf('{{') > -1) {
                node.replaceData(0, node.data.length, this.parseExp(node.data, prefix, ignores));
            }
        } else {
            [].slice.call(node.attributes || []).forEach((attr) => {
                if (prefix) {
                    if (attr.value.indexOf('{{') > -1) {
                        attr.value = this.parseExp(attr.value, prefix, ignores);
                    }
                    if (attr.name === 'wx:for' || attr.name === 'wx:for-items') {
                        let index = node.getAttribute('wx:for-index') || 'index';
                        let item = node.getAttribute('wx:for-item') || 'item';
                        ignores[index] = true;
                        ignores[item] = true;
                        //attr.value = parseExp(attr.value, prefix, ignores);
                    }
                }
                // bindtap="abc" => bindtap="prefix_abc"
                if (attr.name.indexOf('bind') === 0 || attr.name.indexOf('catch') === 0) {
                    if (attr.value.indexOf('(') > 0) {  // method('{{p}}', 123);
                        let funcInfo = this.getFunctionInfo(attr.value);
                        attr.value = funcInfo.name;
                        funcInfo.params.forEach((p, i) => {
                            node.setAttribute('data-wepy-params-' + String.fromCharCode(97 + i), p);
                        });
                    }
                    if (prefix)
                        attr.value = `${PREFIX}${comid}${JOIN}` + attr.value;
                }
            });
            [].slice.call(node.childNodes || []).forEach((child) => {
                this.updateBind(child, prefix, ignores);
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
                let name = (child.nodeName === '#text') ? '' : child.getAttribute('slot');

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
                if (name !== '$$default' && n.nodeName !== '#text')
                    n.removeAttribute('slot');
                doc.appendChild(n);
            });

            node.replaceChild(doc, slot);
        });
        return node;
    },

    compileXML (node, template, prefix, childNodes, comAppendAttribute = {}) {

        this.updateSlot(node, childNodes);

        Object.keys(comAppendAttribute).forEach((key) => {
          node.documentElement.setAttribute(key, comAppendAttribute[key]);
        });

        this.updateBind(node, prefix);

        let componentElements = util.elemToArray(node.getElementsByTagName('component'));
        let customElements = [];
        Object.keys(template.components).forEach((com) => {
            customElements = customElements.concat(util.elemToArray(node.getElementsByTagName(com)));
        });

        componentElements = componentElements.concat(customElements);

        componentElements.forEach((com) => {
            let comAttributes = {};
            let comid, definePath, isCustom = false;
            if (com.nodeName === 'component') {
                [].slice.call(com.attributes || []).forEach((attr) => {
                  comAttributes[attr.name] = attr.value;
                });
                comid = util.getComId(com);
                definePath = util.getComPath(com);
                if (!comid)
                    throw new Error('Unknow component id');
            } else {
                [].slice.call(com.attributes || []).forEach((attr) => {
                  comAttributes[attr.name] = attr.value;
                });
                isCustom = true;
                comid = util.getComId(com);
                definePath = template.components[comid];
                definePath = definePath.indexOf('.') === -1 ? definePath : path.resolve(template.src, '..' + path.sep + template.components[comid])
            }

            let src = util.findComponent(definePath, isCustom);
            if (!src) {
                util.error('找不到组件：' + definePath, '错误');
            } else {
                let wpy = cWpy.resolveWpy(src);
                node.replaceChild(this.compileXML(this.getTemplate(wpy.template.code), wpy.template, prefix ? `${prefix}$${comid}` : `${comid}`, com.childNodes, comAttributes), com);
            }
        });
        return node;
    },

    compile (template) {
        let lang = template.type;
        let content = template.code;

        let config = util.getConfig();
        let src = cache.getSrc();
        let dist = cache.getDist();
        let self = this;


        let compiler = loader.loadCompiler(lang);

        if (!compiler) {
            return;
        }


        compiler(content, config.compilers[lang] || {}).then(content => {

            let node = new DOMParser().parseFromString(content);
            node = this.compileXML(node, template);
            let target = util.getDistPath(path.parse(template.src), 'wxml', src, dist);

            let plg = new loader.PluginHelper(config.plugins, {
                type: 'wxml',
                code: util.decode(node.toString()),
                file: target,
                output (p) {
                    util.output(p.action, p.file);
                },
                done (rst) {
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