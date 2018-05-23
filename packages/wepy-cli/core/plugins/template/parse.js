const htmlparser = require('htmlparser2');
const paramsDetect = require('./../../ast/paramsDetect');
const vueWithTransform = require('vue-template-es2015-compiler');


const forAliasRE = /([^]*?)\s+(?:in|of)\s+([^]*)/;
const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
const stripParensRE = /^\(|\)$/g;
const variableRE = /^\s*[a-zA-Z\$_][a-zA-Z\d_]*\s*$/;
const onRE = /^@|^v-on:/;
const modifierRE = /\.[^.]+/g;


const toAST = (html) => {
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
};
/**
 * parse modifiers
 * @param  {String} name e.g. tap.stop.other
 * @return {Object}      e.g. {stop: true, other: true}
 */
const parseModifiers = (name = '') => {
  let ret = {};
  let match = name.match(modifierRE);
  if (match) {
    match.forEach(function (m) { ret[m.slice(1)] = true; });
  }
  return ret;
};


/**
 * parsse handler AST
 * @param {String} expr   function expression, e.g. doSomething(a,b,c); item++;
 * @return {Object}       AST result
 */
const parseHandlerProxy = (expr) => {

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
    proxy: proxy,
    params: injectParams
  };
};
/**
 * parse event handler
 * @param  {String} key   event key, e.g. tap
 * @param  {String} value event value, e.g. doSomething(item)
 * @return {Object}       parse result, e.g. {type: "bind:tap", name: "doSomething", params: ["item"]}
 */
const parseHandler = (key = '', value = '', modifiers = {}) => {
  let handler = '';
  let type = '';
  let info;
  info = parseHandlerProxy(value.trim());

  if (key === 'click')
    key = 'tap';
  if (modifiers.capture) {
    type = 'capture-';
  }
  type = type + (modifiers.stop ? 'catch' : 'bind') + ':' + key;
  return {
    event: key,
    type: type,
    params: info.params,
    proxy: info.proxy
  };
};

exports = module.exports = function () {


  this.register('template-parse-ast-attr-v-on', function parseAstOn (evt, handler, modifiers) {
    evt = evt.replace(onRE, '');
    let info = parseHandler(evt, handler, modifiers);
    let parsed = {};

    info.params.forEach((p, i) => {
      let paramAttr = 'data-wpy' + info.event.toLowerCase() + '-' + String.fromCharCode(97 + i);
      if (paramAttr.length > 31) {
        this.logger.warn(`Function name is too long, it may cause an Error. "${info.handler}"`);
      }
      parsed[paramAttr] = `{{ ${p} }}`;
    });
    parsed[info.type] = '_proxy';

    info.parsed = parsed;
    return info;
  });

  const ATTR_HANDLERS = {
    'v-for': ({item, name, expr}) => {
      let res = {};
      let inMatch = expr.match(forAliasRE);
      let variableMatch = expr.match(variableRE);
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
      return {
        'wx:for': `{{ ${res.for} }}`,
        'wx:for-index': `${res.iterator1 || 'index'} `,
        'wx:for-item': `${res.alias || 'item'} `,
        'wx:key': `${res.iterator2 || res.iterator1 || 'index'} `
      };
    },
    'v-show': ({item, name, expr}) => ({ hidden: `{{!(${expr})}}` }),
    'v-if': ({item, name, expr}) => ({ 'wx:if': `{{ ${expr} }}` }),
    'v-else-if': ({item, name, expr}) => ({ 'wx:elif': `{{ ${expr} }}` }),
    'wx:else': ({item, name, expr}) => ({ 'wx:else': `{{ ${expr} }}` })
  };

  for (let name in ATTR_HANDLERS) {
    this.register('template-parse-ast-attr-' + name, ATTR_HANDLERS[name]);
  }


  this.register('template-parse-ast-attr', function parseAstAttr (item, rel) {
    let attrs = item.attribs;
    let parsedAttr = {};

    for (let name in attrs) {
      let expr = attrs[name];

      ({ item, name, expr } = this.hookUniqueReturnArg('template-parse-ast-pre-attr-' + name, { item, name, expr }));

      let parsed = this.hookUnique('template-parse-ast-attr-' + name, { item, name, expr });

      let modifiers = parseModifiers(name);
      if (modifiers) {
        name = name.replace(modifierRE, '');
      }
      let handlers = {};
      let isHandler = false;
      if (onRE.test(name)) {  // @ or v-on:
        let parsedOn = this.hookUnique('template-parse-ast-attr-v-on', name, expr, modifiers);
        parsedAttr = Object.assign(parsedAttr, parsedOn.parsed);
        parsedAttr['data-wpy-evt'] = rel.handlers.length;
        rel.handlers.push({
          [parsedOn.event]: parsedOn.proxy
        });
      } else {
        if (parsed) {
          parsedAttr = Object.assign(parsedAttr, parsed);
        } else {
          parsedAttr[name] = expr;
        }
      }
    }

    item.parsedAttr = parsedAttr;

    return [item, rel];
  });

  this.register('template-parse-ast-tag', function parseAstTag (item) {
    let htmlTags = this.tags.htmlTags;
    let wxmlTags = this.tags.wxmlTags;
    let html2wxmlMap = this.tags.html2wxmlMap;
    let logger = this.logger;

    if (html2wxmlMap[item.name]) {  // Tag is in the map list
      logger.silly('html2wxml', `Change "${item.name}" to "${html2wxmlMap[item.name]}"`);
      item.name = html2wxmlMap[item.name];
    } else if (wxmlTags.indexOf(item.name) > -1) { // Tag is a wxml tag
      
    } else if (htmlTags.indexOf(item.name) > -1) { // Tag is a html tag
      logger.silly('html2wxml', `Change "${item.name}" is a html tag, changed to "view"`);
      item.name = 'view';
    } else { // Tag is a unknow tag
      logger.silly('tag', `Assume "${item.name}" is a user defined component`);
    }

    return item;
  });

  this.register('template-parse-ast', function parseAST (ast, rel) {
    ast.forEach(item => {
      if (item.type === 'tag') {
        item = this.hookSeq('template-parse-ast-tag', item);
      }
      if (item.children && item.children.length) {
        [item.childen, rel] = this.hookSeq('template-parse-ast', item.children, rel);
      }
      if (item.attribs) {
        [item, rel] = this.hookSeq('template-parse-ast-attr', item, rel);
      }
    });
    return [ast, rel];
  });

  this.register('template-parse-ast-to-str', function astToStr (ast) {
    let str = '';
    ast.forEach(item => {
      if (item.type === 'text') {
        str += item.data;
      } else if (item.type === 'tag') {
        str += '<' + item.name;
        if (item.parsedAttr) {
          Object.keys(item.parsedAttr).forEach(attr => {
            if (attr !== 'class')
              str += ` ${attr}="${item.parsedAttr[attr]}"`;
          });
        }
        if (item.parsedAttr.class || (item.bindClass && item.bindClass.length)) {
          let staticClass = item.parsedAttr.class || '';
          let bindClass = (item.bindClass && item.bindClass.length) ? ` {{ [ ${item.bindClass.join(',')} ] }}` : '';
          str += ` class="${staticClass + bindClass}"`;
        }
        str += '>';
        if (item.children && item.children.length) {
          str += this.hookUnique('template-parse-ast-to-str', item.children);
        }
        str += `</${item.name}>`;
      }
    });
    return str;
  });

  this.register('template-parse', function parse (html) {

    return toAST(html).then((ast) => {

      let rel = { handlers: []};

      [ast, rel] = this.hookSeq('template-parse-ast', ast, rel);

      let code = this.hookUnique('template-parse-ast-to-str', ast);

      return {
        code: code,
        rel: rel,
        ast: ast
      };
    });
  });
};

