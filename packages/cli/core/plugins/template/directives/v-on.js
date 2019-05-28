const vueWithTransform = require('vue-template-es2015-compiler');
const paramsDetect = require('./../../../ast/paramsDetect');
const CONST = require('./../../../util/const');

/**
 * parsse handler AST
 * @param {String} expr   function expression, e.g. doSomething(a,b,c); item++;
 * @return {Object}       AST result
 */
const parseHandlerProxy = (expr, scope) => {

  let injectParams = [];
  let handlerExpr = expr;
  let eventInArg = false;

  let parsedHandler;
  if (/^\w+$/.test(expr)) {  //   @tap="doSomething"
    eventInArg = true;
    parsedHandler = {
      callee: { name: handlerExpr }
    }
    handlerExpr += '($event)';
  } else {
    try {
      parsedHandler = paramsDetect(handlerExpr);
    } catch (e) {
      throw new Error(`Can not parse "${handlerExpr}"`);
    }

    for (let id in parsedHandler.identifiers) {
      let fetch = scope;
      while(fetch) {
        if (!parsedHandler.identifiers[id].callable && fetch.declared.indexOf(id) !== -1) {
          injectParams.push(id);
          break;
        }
        fetch = fetch.parent;
      }
    }

    if (parsedHandler.identifiers.$event) {
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
    params: injectParams,
    parsed: parsedHandler,
  };
};

/**
 * parse event handler
 * @param  {String} key   event key, e.g. tap
 * @param  {String} value event value, e.g. doSomething(item)
 * @return {Object}       parse result, e.g. {type: "bind:tap", name: "doSomething", params: ["item"]}
 */
const parseHandler = (name = '', value = '', scope) => {
  let handler = '';
  let type = '';
  let info;
  info = parseHandlerProxy(value, scope);

  if (name === 'click')
    name = 'tap';
  type = 'bind' + name;
  return {
    event: name,
    type: type,
    params: info.params,
    proxy: info.proxy,
    parsed: info.parsed,
    expr: CONST.EVENT_PROXY
  };
};
/*
 * parse @tap="click", v-on:tap="click"
 */
exports = module.exports = function () {

  let totalEvtCache = {};  // Global event cache

  this.register('template-parse-ast-attr-v-on.capture', function ({ item, name, expr, event, scope, ctx }) {
    event.type = 'capture-' + event.type;
    return { item, name, expr, event, scope, ctx };
  });

  this.register('template-parse-ast-attr-v-on.stop', function ({ item, name, expr, event, scope, ctx }) {
    event.type = event.type.replace(/^bind/, 'catch');
    return { item, name, expr, event, scope, ctx };
  });

  this.register('template-parse-ast-attr-v-on.wxs', function ({ item, name, expr, event, scope, ctx }) {
    event.expr = event.parsed.callee.name;
    event.proxy = false;
    event.params = event.parsed.params.map(p => {
      if (p.type === 'Literal') {
        return p.name;
      } else {
        return `{{ ${p.name} }}`;
      }
    });
    return { item, name, expr, event, scope, ctx };
  });

  this.register('template-parse-ast-attr-v-on', function parseAstOn ({ item, name, expr, modifiers, scope, ctx }) {
    let handler = expr.trim();

    let parsedEvent = parseHandler(name, handler, scope);

    for (let k in modifiers) {
      let hookName = 'template-parse-ast-attr-v-on.' + k;
      if (this.hasHook(hookName)) {
        this.hook(hookName, { item, name, expr, event: parsedEvent, scope, ctx });
      }
    }
    parsedEvent.params.forEach((p, i) => {
      let paramAttr = 'data-wpy' + parsedEvent.event.toLowerCase() + '-' + String.fromCharCode(97 + i);
      if (paramAttr.length > 31) {
        this.logger.warn(`Function name is too long, it may cause an Error. "${parsedEvent.handler}"`);
      }
    });
    parsedEvent.tag = item.name;
    if (parsedEvent.proxy) {
      let assetsId = this.assets.get(ctx.file);
      let evtCache;

      if (!totalEvtCache[assetsId]) {
        totalEvtCache[assetsId] = {
          increaseId: 0
        };
      }
      evtCache = totalEvtCache[assetsId];

      if (!item.events) {
        item.events = [];
        parsedEvent.id = `${assetsId}-${evtCache.increaseId}`;
      } else {
        parsedEvent.id = item.events[item.events.length - 1].id;
      }
      if (!ctx.events) { // generate rel
        ctx.events = [];
        ctx.events.push(parsedEvent);
      }
      evtCache.increaseId++;
      parsedEvent.params = parsedEvent.params.map(p => `{{ ${p} }}`);
    }
    if (!item.events) {
      item.events = [];
    }
    item.events.push(parsedEvent);

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

