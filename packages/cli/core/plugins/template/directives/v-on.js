const vueWithTransform = require('vue-template-es2015-compiler');
const paramsDetect = require('./../../../ast/paramsDetect');

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
    let identifiers;
    try {
      identifiers = paramsDetect(handlerExpr);
    } catch (e) {
      throw new Error(`Can not parse "${handlerExpr}"`);
    }


    for (let id in identifiers) {
      let fetch = scope;
      while(fetch) {
        if (!identifiers[id].callable && fetch.declared.indexOf(id) !== -1) {
          injectParams.push(id);
          break;
        }
        fetch = fetch.parent;
      }
    }

    if (identifiers.$event) {
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
  type = type + (modifiers.stop ? 'catch' : 'bind') + key;
  return {
    event: key,
    type: type,
    params: info.params,
    proxy: info.proxy
  };
};
/*
 * parse @tap="click", v-on:tap="click"
 */
exports = module.exports = function () {

  let evtid = 0; // Global event id

  this.register('template-parse-ast-attr-v-on', function parseAstOn ({ item, name, expr, modifiers, scope, ctx }) {
    let evt = name;
    let handler = expr;
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

    info.tag = item.name;
    if (!item.events) {
      item.events = [];
      info.evtid = evtid;
    } else {
      info.evtid = item.events[item.events.length - 1].evtid;
    }
    item.events.push(info);
    evtid++;
    return {
      hook: 'template-parse-ast-attr-v-on-apply',
      'v-on': info,
      attrs: {}
    };
  });


  this.register('template-parse-ast-attr-v-on-apply', function parseBindClass ({ parsed, rel }) {
    let vOn = parsed['v-on'];

    let isComponent = !!rel.components[vOn.tag];

    if (isComponent) { // it is a custom defined component
      rel.on[vOn.event] = rel.handlers.length;
      rel.handlers.push({
        [vOn.event]: vOn.proxy
      })
    } else {
      if (!rel.handlers[vOn.evtid])
        rel.handlers[vOn.evtid] = {};

      rel.handlers[vOn.evtid][vOn.event] = vOn.proxy;
    }
    return { parsed, rel };
  });
};

