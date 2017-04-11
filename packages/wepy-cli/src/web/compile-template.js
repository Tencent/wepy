import {DOMParser, DOMImplementation} from 'xmldom';

import util from '../util';
import loader from '../loader';

import mmap from './modulemap';


const WEAPP_TAGS = ['view', 'text', 'navigator', 'image'];
const HTML_TAGS = ['div', 'span', 'a', 'img'];


const TAGS_MAP = {
    'view': 'div',
    'text': 'span',
    'navigator': 'a',
    'image': 'img',
};

const ATTRS_MAP = {
    'bindtap': '@click',
    'catchtap': '@click.stop'
}




export default {



    getTemplate (content) {
        content = `<template>${content}</template>`;
        let doc = new DOMImplementation().createDocument();
        let node = new DOMParser().parseFromString(content);
        let template = [].slice.call(node.childNodes || []).filter((n) => n.nodeName === 'template');

        [].slice.call(template[0].childNodes || []).forEach((n) => {
            doc.appendChild(n);
        });
        return doc;
    },

    changeExp (str) {
        let c, i = 0, l = str.length, flag = [], 
            normalWord = '', expWord = [],
            rst = [];

        for (i = 0; i < l; i++) {
            c = str[i];
            if (c === '{' && i < l - 1 && str[i + 1] === '{') {
                if (flag.length === 0) {
                    flag.push('{}');
                    i++;
                    if (normalWord) {
                        rst.push(`'${normalWord}'`);
                        normalWord = '';
                    }
                    continue;
                }
            } else if (c === '}' && i < l - 1 && str[i + 1] === '}') {
                if (flag.length) {
                    if (flag[flag.length - 1] === '{}') {
                        flag.pop();
                        i++;
                        if (expWord) {
                            rst.push(expWord);
                            expWord = '';
                        }
                        continue;
                    }
                }
            } else if (c === '\'' || c === '"') { // aaa {{bb+'}}'}}
                if (flag.length) {
                    if (flag[flag.length - 1] === c) {
                        flag.pop();
                    } else {
                        flag.push(c);
                    }
                }
            }
            if (flag.length) {
                expWord += c;
            } else {
                normalWord += c;
            }
        }

        if (normalWord) {
            rst.push(`'${normalWord}'`);
        }
        if (expWord) {
            rst.push(expWord);
        }
        return rst.join(' + ');
    },

    replaceWXML (content) {

        let node = typeof(content) === 'string' ? this.getTemplate(content) : content;

        if (!node || !node.childNodes || node.childNodes.length === 0)
            return;
        else {
            [].slice.call(node.childNodes || []).forEach((child) => {
                if (child.nodeName === '#text') {

                } else {
                    // replace tag name.
                    if (TAGS_MAP[child.tagName]) { 
                        child.tagName = TAGS_MAP[child.tagName];
                    }

                    [].slice.call(child.attributes || []).forEach(attr => {
                        if (ATTRS_MAP[attr.name]) {
                            child.setAttribute(ATTRS_MAP[attr.name], attr.value);
                            child.removeAttribute(attr.name);
                        } else if (attr.value.indexOf('{{') > -1 && attr.value.indexOf('}}') > -1) {
                            child.setAttribute(':' + attr.name, this.changeExp(attr.value));
                            child.removeAttribute(attr.name);
                        }
                    });
                }
                this.replaceWXML(child);
            });
        }

        /*let k;
        for (k in TAGS_MAP) {
            let openreg = new RegExp(`<${k}`, 'ig'),
                closereg = new RegExp(`</${k}`, 'ig');
            str = str.replace(openreg, `<${TAGS_MAP[k]}`).replace(closereg, `</${TAGS_MAP[k]}`);
        }

        for (k in ATTRS_MAP) {
            let reg = new RegExp('\s*${k}\s*=?')
        }

        return str.replace(/[\r\n]/ig, '');*/
    },

    compile (wpy) {
        let config = util.getConfig();
        let compiler = loader.loadCompiler(wpy.template.type);

        if (!compiler) {
            return;
        }

        return compiler(wpy.template.code, config.compilers[wpy.template.type] || {}).then(rst => {

            let node = this.getTemplate(rst);
            this.replaceWXML(node);
            wpy.template.code = node.toString();
            let templateId = mmap.add(wpy.template.src + '-template', {
                type: 'template',
                source: wpy
            });
            wpy.template.id = templateId;
        });
    }
}
