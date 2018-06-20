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
const astParser = require('./ast/toAST');
const paramsDetect = require('./ast/paramsDetect');
const vueWithTransform = require('vue-template-es2015-compiler');
const {
  forAliasRE,
  forIteratorRE,
  stripParensRE,
  variableRE,
  onRE,
  modelRE,
  modifierRE
} = require('./shared/reg');

exports = module.exports =  {

  parse (compiled, ctx) {
    let code = compiled.content;
    let msg = xmllint.verify(code);
    msg.forEach(item => {
      let type = item.type === 'warning' ? 'warn' : 'error';
      errorHandler[type](item.message, ctx.file, code, { start: {line: item.line, column: item.col}});
    });

    return this.compilation.hookUnique('template-parse', compiled.content).then(rst => {
      compiled.code = rst.code;
      compiled.rel = rst.rel;
      return compiled;
    });
     
    return this.getAST(compiled.content).then(ast => {
      this.eventHandlers = [];
      this.parseInfo = {
        handlers: []
      };
      ast = this.transforAST(ast);
      debugger;
      compiled.code = this.astToString(ast);
      compiled.eventHandlers = this.eventHandlers;
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
    let parsedAttr = {};
    
    parsedAttr = this.hookUnique('template-parse-ast-attr', attrs);

    for (let name in attrs) {
      let expr = attrs[name];
      let modifiers = this.parseModifiers(name);
      if (modifiers) {
        name= name.replace(modifierRE, '');
      }
      let handlers = {};
      let isHandler = false;
      if (modelRE.test(name)) {
        // v-model
        // e.g: <input v-model="lovingWepy">
        const parsedModel = this.hookUnique('template-parse-ast-attr-v-model', name, expr, modifiers);
        // Todo
      } else if (onRE.test(name)) {  
        // @ or v-on:
        // e.g: <input @tap="tapHandle">
        const parsedOn = this.hookUnique('template-parse-ast-attr-v-on', name, expr, modifiers);
        parsedAttr = Object.assign({}, parsedAttr, parsedOn);

        handlers[info.event] = info.proxy;
        isHandler = true;
      }
      if (isHandler) {
        parsedAttr['data-wpy-evt'] = this.eventHandlers.length;
        this.eventHandlers.push(handlers);
      } else {
        parsedAttr[name] = attrs[name];
      }
    }
    return parsedAttr;
  },

  /**
   * parsse handler AST
   * @param {String} expr   function expression, e.g. doSomething(a,b,c); item++;
   * @return {Object}       AST result
   */
  parseHandlerProxy (expr) {

    let injectParams = [];
    let handlerExpr = expr;

    if (/^\w+$/.test(expr)) {  //   @tap="doSomething"
      handlerExpr += '()';
    }

    let detected = paramsDetect(handlerExpr);

    Object.keys(detected).forEach(d => {
      if (!detected[d].callable) {
        //injectParams.push(d);
      }
    });

    let proxy = `function proxyHandler (${injectParams.join(', ')}) {
      with (this) {
        return (function () {
          ${handlerExpr}
        })();
      }
    }`;

    proxy = vueWithTransform(proxy);  // transform this
    proxy = proxy.replace('var _h=_vm.$createElement;var _c=_vm._self._c||_h;', ''); // removed unused vue code;
    return {
      handler: 'handlerProxy',
      proxy: proxy,
      params: injectParams
    };
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
    info = this.parseHandlerProxy(value.trim());

    if (key === 'click')
      key = 'tap';
    if (modifiers.capture) {
      type = 'capture-';
    }
    type = type + (modifiers.stop ? 'catch' : 'bind') + ':' + key;
    return {
      event: key,
      type: type,
      handler: info.handler,
      params: info.params,
      proxy: info.proxy
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
