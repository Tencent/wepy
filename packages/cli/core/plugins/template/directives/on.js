const vueWithTransform = require('vue-template-es2015-compiler');
const paramsDetect = require('../../../ast/paramsDetect');

const onRE = /^@|^v-on:/;

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

exports = module.exports = function () {
  
  this.register('template-parse-ast-attr-v-on', function parseAstOn (item, evt, handler, modifiers, scope) {
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
};
