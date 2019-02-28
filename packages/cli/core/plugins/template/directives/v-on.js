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
  let eventInArg = false;

  if (/^\w+$/.test(expr)) {  //   @tap="doSomething"
    handlerExpr += '($event)';
    eventInArg = true;
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
      eventInArg = true;
    }
  }


  let proxy = `function proxy (${injectParams.join(', ')}) {
    ${eventInArg ? 'let $event = arguments[arguments.length - 1];' : ''}
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
  info = parseHandlerProxy(value, scope);

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

  let totalEvtCache = {};  // Global event cache

  this.register('template-parse-ast-attr-v-on', function parseAstOn ({ item, name, expr, modifiers, scope, ctx }) {
    let evt = name;
    let handler = expr.trim();
    let parsedEvent = parseHandler(evt, handler, modifiers, scope);

    let assetsId = this.assets.get(ctx.file);
    let evtCache;

    if (!totalEvtCache[assetsId]) {
      totalEvtCache[assetsId] = {
        increaseId: 0
      };
    }

    evtCache = totalEvtCache[assetsId];

    parsedEvent.params.forEach((p, i) => {
      let paramAttr = 'data-wpy' + parsedEvent.event.toLowerCase() + '-' + String.fromCharCode(97 + i);
      if (paramAttr.length > 31) {
        this.logger.warn(`Function name is too long, it may cause an Error. "${parsedEvent.handler}"`);
      }
    });

    parsedEvent.tag = item.name;
    parsedEvent.expr = handler;

    if (!item.events) {
      item.events = [];
      parsedEvent.id = `${assetsId}-${evtCache.increaseId}`;
    } else {
      parsedEvent.id = item.events[item.events.length - 1].id;
    }
    item.events.push(parsedEvent);
    if (!ctx.events) {
      ctx.events = [];
    }
    ctx.events.push(parsedEvent);
    evtCache.increaseId++;
    return {
      hook: 'template-parse-ast-attr-v-on-apply',
      'v-on': parsedEvent,
      attrs: {}
    };
  });


  this.register('template-parse-ast-attr-v-on-apply', function parseBindClass ({ parsed, rel }) {
    let vOn = parsed['v-on'];

    let isComponent = !!rel.components[vOn.tag];

    if (isComponent) { // it is a custom defined component
      rel.on[vOn.id] = rel.on[vOn.id] || [];

      if (rel.on[vOn.id].includes(vOn.event)) {
        // Todo: repeat event
        // this.logger.warn('v-on', ``);
      } else {
        rel.on[vOn.id].push(vOn.event);
      }      
    }
    if (!rel.handlers[vOn.id])
      rel.handlers[vOn.id] = {};

    rel.handlers[vOn.id][vOn.event] = vOn.proxy;

    return { parsed, rel };
  });
};

