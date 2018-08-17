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

  this.register('template-parse-ast-attr-v-on', function parseAstOn (item, evt, handler, modifiers, scope) {
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
    return info;
  });


  this.register('template-parse-ast-attr-v-on-apply', function parseBindClass ({ parsed, attrs, rel }) {

    let isComponent = !!rel.components[parsed.tag];

    if (isComponent) { // it is a custom defined component
      rel.on[parsed.event] = rel.handlers.length;
      rel.handlers.push({
        [parsed.event]: parsed.proxy
      })
    } else {
      if (!rel.handlers[parsed.evtid])
        rel.handlers[parsed.evtid] = {};

      rel.handlers[parsed.evtid][parsed.event] = parsed.proxy;
    }
  });
};

