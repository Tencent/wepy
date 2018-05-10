/**
 * Tencent is pleased to support the open source community by making WePY available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
const fs = require('fs');
const path = require('path');
const htmlparser = require('htmlparser2');
const parseOptions = require('./parseOptions');
const tag = require('./tag');
const xmllint = require('./util/xmllint');
const errorHandler = require('./util/error');


const forAliasRE = /([^]*?)\s+(?:in|of)\s+([^]*)/;
const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
const stripParensRE = /^\(|\)$/g;
const variableRE = /^\s*[a-zA-Z\$_][a-zA-Z\d_]*\s*$/;
const onRE = /^@|^v-on:/;
const modifierRE = /\.[^.]+/g;


exports = module.exports =  {

  parse (compiled, ctx) {
    let code = compiled.content;
    let msg = xmllint.verify(code);
    msg.forEach(item => {
      let type = item.type === 'warning' ? 'warn' : 'error';
      errorHandler[type](item.message, ctx.file, code, { start: {line: item.line, column: item.col}});
    });
    return this.getAST(compiled.content).then(ast => {
      ast = this.transforAST(ast);
      debugger;
      compiled.code = this.astToString(ast);
      return compiled;
    }).catch(e => {
      throw e;
    })
  },

  getAST (html) {
    return new Promise((resolve, reject) => {
      const handler = new htmlparser.DomHandler(function (error, dom) {
        if (error) {
          reject(error);
        } else {
          resolve(dom);
        }
      });
      const parser = new htmlparser.Parser(handler);
      parser.write(html);
      parser.end();
    });
  },

  transforAST (ast) {
    ast.forEach(item => {
      if (item.type === 'tag') {
        this.transforTag(item);
      }
      if (item.children && item.children.length) {
        this.transforAST(item.children);
      }
      if (item.attribs) {
        item.attribs = this.transforAttr(item, item.attribs);
      }
    });
    return ast;
  },

  transforTag (item = {}) {

    let htmlTags = this.compilation.tags.htmlTags;
    let wxmlTags = this.compilation.tags.wxmlTags;
    let html2wxmlMap = this.compilation.tags.html2wxmlMap;
    let logger = this.compilation.logger;

    if (html2wxmlMap[item.name]) {  // Tag is in the map list
      logger.silly('html2wxml', `Change "${item.name}" to "${html2wxmlMap[item.name]}"`);
      item.name = html2wxmlMap[item.name];
    } else if (wxmlTags.indexOf(item.name) > -1) { // Tag is a wxml tag
      return;
    } else if (htmlTags.indexOf(item.name) > -1) { // Tag is a html tag
      logger.silly('html2wxml', `Change "${item.name}" is a html tag, changed to "view"`);
      item.name = 'view';
    } else { // Tag is a unknow tag
      logger.silly('tag', `Assume "${item.name}" is a user defined component`);
      return;
    }
  },

  transforAttr (item = {}, attrs = {}) {
    let rst = {};
    if (attrs['class']) {
      rst.class = attrs['class'];
      delete attrs['class'];
    } else if (attrs['v-for']) {
      // {for: "list", alias: "value", iterator1: "key", iterator2: "index"}
      let forExp = this.parseFor(attrs['v-for']);
      rst['wx:for'] = `{{ ${forExp.for} }}`;
      rst['wx:for-index'] = `${forExp.iterator1 || 'index'} `;
      rst['wx:for-item'] = `${forExp.alias || 'item'} `;
      rst['wx:key'] = `${forExp.iterator2 || forExp.iterator1 || 'index'} `;
      delete attrs['v-for'];
    } else if (attrs['v-show']) {
      let exp = `{{!(${attrs['v-show']})}}`;
      rst.hidden = exp;
      delete attrs['v-show'];
    } else if (attrs['v-if']) {
      rst['wx:if'] = `{{ ${attrs['v-if']} }}`;
      delete attrs['v-if'];
    } else if (attrs['v-else-if']) {
      rst['wx:elif'] = `{{ ${attrs['v-else-if']} }}`;
      delete attrs['v-else-if'];
    } else if (attrs['v-else-if']) {
      rst['wx:else'] = `{{ ${attrs['v-else']} }}`;
      delete attrs['v-else'];
    }

    for (let k in attrs) {
      let val = attrs[k];
      let modifiers = this.parseModifiers(k);
      if (modifiers) {
        k = k.replace(modifierRE, '');
      }
      if (onRE.test(k)) {  // @ or v-on:
        k = k.replace(onRE, '');
        let info = this.parseHandler(k, val, modifiers);

        info.params.forEach((p, i) => {
          let paramAttr = 'data-wpy' + info.handler.toLowerCase() + '-' + String.fromCharCode(97 + i);
          if (paramAttr.length > 31) {
            this.compilation.logger.warn(`Function name is too long, it may cause an Error. "${info.handler}"`);
          }
          rst[paramAttr] = `{{ ${p} }}`;
        });
        rst[info.type] = info.handler;
        break;
      }
      rst[k] = attrs[k];
    }

    return rst;
  },

  /**
   * parse event handler
   * @param  {String} key   event key, e.g. tap
   * @param  {String} value event value, e.g. doSomething(item)
   * @return {Object}       parse result, e.g. {type: "bind:tap", name: "doSomething", params: ["item"]}
   */
  parseHandler (key = '', value = '', modifiers = {}) {
    let handler = '';
    let type = '';
    let info;
    info = this.parseFunction(value);

    if (key === 'click')
      key = 'tap';
    if (modifiers.capture) {
      type = 'capture-';
    }
    type = type + (modifiers.stop ? 'catch' : 'bind') + ':' + key;
    return { 
      type: type,
      handler: info.name,
      params: info.params
    };
  },

  /**
   * parse Function
   * @param  {String} exp function expression, e.g. soSomething('a', 0, a, $event);
   * @return {Object}     {name: 'doSomething', params: ["'a'", 0, a, $event]}
   */
  parseFunction (exp = '') {
    let rst = {name: '', params: []}, char = '', tmp = '', stack = [];
    if (exp.indexOf('(') === -1) {
      rst.name = exp.replace(/^\s*/ig, '').replace(/\s*$/ig, '');
      return rst;
    }
    for (let i = 0, len = exp.length; i < len; i++) {
      char = exp[i];
      if (!rst.name) {
        if (char === '(') {
          rst.name = tmp.trim();
          tmp = '';
          continue;
        }
      }
      if ((char === ',' || char === ')') && stack.length === 0) {
        let p = tmp.replace(/^\s*/ig, '').replace(/\s*$/ig, '');
        /*
        if (p && (p[0] === '"' || p[0] === '\'') && p[0] === p[p.length - 1]) {
          p = p.substring(1, p.length - 1);
        }*/
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

  /**
   * parse modifiers
   * @param  {String} name e.g. tap.stop.other
   * @return {Object}      e.g. {stop: true, other: true}
   */
  parseModifiers (name = '') {
    let ret = {};
    let match = name.match(modifierRE);
    if (match) {
      match.forEach(function (m) { ret[m.slice(1)] = true; });
    }
    return ret;
  },


  /**
   * parser v-for
   * @param  {String} exp expresion
   * @return {Object}     parse result
   */
  parseFor (exp = '') {
    let res = {};
    let inMatch = exp.match(forAliasRE);
    let variableMatch = exp.match(variableRE);
    if (variableMatch) {
      // e.g: v-for="items"
      res.alias = 'item';
      res.for = variableMatch[0].trim();
      return res;
    }
    
    if (!inMatch) {
      return res;
    }
    res.for = inMatch[2].trim();
    let alias = inMatch[1].trim().replace(stripParensRE, '');
    let iteratorMatch = alias.match(forIteratorRE);
    if (iteratorMatch) {
      res.alias = alias.replace(forIteratorRE, '').trim();
      res.iterator1 = iteratorMatch[1].trim();
      if (iteratorMatch[2]) {
        res.iterator2 = iteratorMatch[2].trim();
      }
    } else {
      res.alias = alias;
    }
    return res
  },


  astToString (ast) {
    let str = '';
    ast.forEach(item => {
      if (item.type === 'text') {
        str += item.data;
      } else if (item.type === 'tag') {
        str += '<' + item.name;
        if (item.attribs) {
          Object.keys(item.attribs).forEach(attr => {
            str += ` ${attr}="${item.attribs[attr]}"`;
          });
        }
        str += '>';
        if (item.children && item.children.length) {
          str += this.astToString(item.children);
        }
        str += `</${item.name}>`;
      }
    });
    return str;
  }
}
