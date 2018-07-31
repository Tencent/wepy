const htmlparser = require('htmlparser2');
const paramsDetect = require('./../../ast/paramsDetect');
const vueWithTransform = require('vue-template-es2015-compiler');
const tools = require('../../util/tools');


const forAliasRE = /([^]*?)\s+(?:in|of)\s+([^]*)/;
const forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
const stripParensRE = /^\(|\)$/g;
const variableRE = /^\s*[a-zA-Z\$_][a-zA-Z\d_]*\s*$/;
const onRE = /^@|^v-on:/;
const bindRE = /^:|^v-bind:/;
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
const parseHandlerProxy = (expr, scope) => {

  let injectParams = [];
  let handlerExpr = expr;
  let functionName = 'proxyHandler';

  if (/^\w+$/.test(expr)) {  //   @tap="doSomething"
    injectParams.push('$event');
    handlerExpr += '($event)';
    functionName = 'proxyHandlerWithEvent';
  } else {
    let detected;
    try {
      detected = paramsDetect(handlerExpr);
    } catch (e) {
      throw new Error(`Can not parse "${handlerExpr}"`);
    }

    Object.keys(detected).forEach(d => {
      if (scope && !detected[d].callable && scope.declared.indexOf(d) !== -1) {
        injectParams.push(d);
      }
    });

    if (detected.$event) {
      injectParams.push('$event');
      functionName = 'proxyHandlerWithEvent';
    }
  }


  let proxy = `function ${functionName} (${injectParams.join(', ')}) {
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
const parseHandler = (key = '', value = '', modifiers = {}, scope) => {
  let handler = '';
  let type = '';
  let info;
  info = parseHandlerProxy(value.trim(), scope);

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


  this.register('template-parse-ast-attr-v-bind', function parseAstBind (name, value, modifiers) {
    return {
      name: name,
      prop: name.replace(bindRE, ''),
      value: value,
      expr: `{{ ${value} }}`
    };
  });

  this.register('template-parse-ast-attr-v-on', function parseAstOn (evt, handler, modifiers, scope) {
    evt = evt.replace(onRE, '');
    let info = parseHandler(evt, handler, modifiers, scope);
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
    'v-for': ({item, name, expr, parentScope}) => {
      let res = {};
      let scope = {};
      let inMatch = expr.match(forAliasRE);
      let variableMatch = expr.match(variableRE);
      if (variableMatch) {
        // e.g: v-for="items"
        res.alias = 'item';
        res.for = variableMatch[0].trim();
        scope.for = res.for;
        scope.declared = [];
      }

      if (inMatch) {
        scope.declared = scope.declared || [];
        res.for = inMatch[2].trim();
        let alias = inMatch[1].trim().replace(stripParensRE, '');
        let iteratorMatch = alias.match(forIteratorRE);
        if (iteratorMatch) {
          res.alias = alias.replace(forIteratorRE, '').trim();
          scope.declared.push(res.alias);
          scope.alias = res.alias;
          res.iterator1 = iteratorMatch[1].trim();
          scope.iterator1 = res.iterator1;
          scope.declared.push(res.iterator1);
          if (iteratorMatch[2]) {
            res.iterator2 = iteratorMatch[2].trim();
            scope.iterator2 = res.iterator2;
            scope.declared.push(res.iterator2);
          }
        } else {
          res.alias = alias;
          scope.alias = alias;
          scope.declared.push(alias);
        }
      }
      if (parentScope)
        scope.parent = parentScope;
      return {
        scope: scope,
        attrs: {
          'wx:for': `{{ ${res.for} }}`,
          'wx:for-index': `${res.iterator1 || 'index'}`,
          'wx:for-item': `${res.alias || 'item'}`,
          'wx:key': `${res.iterator2 || res.iterator1 || 'index'}`
        }
      };
    },
    'v-show': ({item, name, expr}) => ({attrs: { hidden: `{{ !(${expr}) }}` }}),
    'v-if': ({item, name, expr}) => ({attrs: { 'wx:if': `{{ ${expr} }}` }}),
    'v-else-if': ({item, name, expr}) => ({attrs: { 'wx:elif': `{{ ${expr} }}` }}),
    'v-else': ({item, name, expr}) => ({attrs: { 'wx:else': true }})
  };

  for (let name in ATTR_HANDLERS) {
    this.register('template-parse-ast-attr-' + name, ATTR_HANDLERS[name]);
  }


  this.register('template-parse-ast-attr', function parseAstAttr (item, scope, rel) {
    let attrs = item.attribs;
    let parsedAttr = {};
    let isComponent = !!rel.components[item.name];
    let parsed = null;

    for (let name in attrs) {
      let expr = attrs[name];

      ({ item, name, expr } = this.hookUniqueReturnArg('template-parse-ast-pre-attr-' + name, { item, name, expr }));

      parsed = this.hookUnique('template-parse-ast-attr-' + name, { item, name, expr, scope });

      if (parsed && parsed.scope) {
        scope = parsed.scope;
      }

      let modifiers = parseModifiers(name);
      if (modifiers) {
        name = name.replace(modifierRE, '');
      }
      let handlers = {};
      let isHandler = false;
      if (bindRE.test(name)) { // :prop or v-bind:prop;

        let parsedBind = this.hookUnique('template-parse-ast-attr-v-bind', name, expr, modifiers, scope);
        if (isComponent) { // It's a prop
          parsedAttr[parsedBind.prop] = parsedBind.expr;
        } else {
          // TODO:
        }

      } else if (onRE.test(name)) {  // @ or v-on:
        let parsedOn = this.hookUnique('template-parse-ast-attr-v-on', name, expr, modifiers, scope);
        if (isComponent) {
          rel.on[parsedOn.event] = rel.handlers.length;
          rel.handlers.push({
            [parsedOn.event]: parsedOn.proxy
          });
        } else {
          parsedAttr = Object.assign(parsedAttr, parsedOn.parsed);
          if (parsedAttr['data-wpy-evt'] === undefined) {
            parsedAttr['data-wpy-evt'] = rel.handlers.length;
            rel.handlers.push({
              [parsedOn.event]: parsedOn.proxy
            });
          } else {
            rel.handlers[parsedAttr['data-wpy-evt']][parsedOn.event] = parsedOn.proxy
          }
        }
      } else {
        if (parsed) {
          parsedAttr = Object.assign(parsedAttr, parsed.attrs);
        } else {
          parsedAttr[name] = expr;
        }
      }
    }

    item.parsedAttr = parsedAttr;

    return [item, scope, rel];
  });

  this.register('template-parse-ast-tag', function parseAstTag (item, rel) {
    let htmlTags = this.tags.htmlTags;
    let wxmlTags = this.tags.wxmlTags;
    let html2wxmlMap = this.tags.html2wxmlMap;
    let logger = this.logger;

    let components = rel.components;
    if (components[item.name]) { // It's a user defined component
      logger.silly('tag', `Found user defined component "${item.name}"`);
      item.attribs = item.attribs || {};
      item.attribs['bind_init'] = "_initComponent";
    } else if (html2wxmlMap[item.name]) {  // Tag is in the map list
      logger.silly('html2wxml', `Change "${item.name}" to "${html2wxmlMap[item.name]}"`);
      item.name = html2wxmlMap[item.name];
    } else if (wxmlTags.indexOf(item.name) > -1) { // Tag is a wxml tag

    } else if (htmlTags.indexOf(item.name) > -1) { // Tag is a html tag
      logger.silly('html2wxml', `Change "${item.name}" is a html tag, changed to "view"`);
      item.name = 'view';
    } else { // Tag is a unknow tag
      logger.silly('tag', `Assume "${item.name}" is a user defined component`);
    }

    return [item, rel];
  });

  this.register('template-parse-ast', function parseAST (ast, scope, rel) {
    ast.forEach(item => {
      if (item.type === 'tag') {
        [item, rel] = this.hookSeq('template-parse-ast-tag', item, rel);
      }
      if (item.attribs) {
        [item, scope, rel] = this.hookSeq('template-parse-ast-attr', item, scope, rel);
      }
      if (item.children && item.children.length) {
        [item.childen, scope, rel] = this.hookSeq('template-parse-ast', item.children, scope, rel);
      }
    });
    return [ast, scope, rel];
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
            if (item.parsedAttr[attr] !== undefined && attr !== 'class' && attr !== 'style')
              str += tools.isTrue(item.parsedAttr[attr])
                ? ` ${attr}`
                : ` ${attr}="${item.parsedAttr[attr]}"`;
          });
        }
        if (item.parsedAttr.style || (item.bindStyle && item.bindStyle.length)) {
          let staticStyle = item.parsedAttr.style || '';
          let bindStyle = (item.bindStyle && item.bindStyle.length) ? ` {{ ${item.bindStyle.join(' + ')} }}` : '';
          str += ` style="${staticStyle + bindStyle}"`;
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

  this.register('template-parse', function parse (html, components) {

    return toAST(html).then((ast) => {

      let rel = { handlers: [], components: components, on: {}};
      let scope = null;

      [ast, scope, rel] = this.hookSeq('template-parse-ast', ast, null, rel);

      let code = this.hookUnique('template-parse-ast-to-str', ast);

      return {
        code: code,
        rel: rel,
        ast: ast
      };
    });
  });
};

