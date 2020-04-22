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
  let needDeclareWx = false;
  let argumentsInArg = false;

  let parsedHandler;
  // eslint-disable-next-line
  if (/^[\w\.]+$/.test(expr)) {
    //   @tap="doSomething" or @tap="m.doSomething"
    needDeclareWx = true;
    argumentsInArg = true;
    eventInArg = true;

    parsedHandler = {
      callee: { name: handlerExpr },
      params: []
    };
    handlerExpr = `${expr}.apply(_vm, $args || [$event])`;
  } else {
    try {
      parsedHandler = paramsDetect(handlerExpr);
    } catch (e) {
      throw new Error(`Can not parse "${handlerExpr}"`);
    }

    for (let id in parsedHandler.identifiers) {
      let fetch = scope;
      while (fetch) {
        if (!parsedHandler.identifiers[id].callable && fetch.declared.indexOf(id) !== -1) {
          injectParams.push(id);
          break;
        }
        fetch = fetch.parent;
      }
    }

    if (parsedHandler.identifiers.$event) {
      needDeclareWx = true;
      eventInArg = true;
    }

    if (parsedHandler.identifiers.$wx) {
      needDeclareWx = true;
    }

    if (parsedHandler.identifiers.arguments) {
      needDeclareWx = true;
      argumentsInArg = true;
      handlerExpr = handlerExpr.replace('arguments', '$args');
    }
  }

  const functionCode = handlerExpr;

  let declaredCodes = [];

  declaredCodes.push('const _vm=this;');
  if (needDeclareWx) {
    declaredCodes.push('const $wx = arguments[arguments.length - 1].$wx;');
  }
  if (eventInArg) {
    declaredCodes.push(
      '  const $event = ($wx.detail && $wx.detail.arguments) ? $wx.detail.arguments[0] : arguments[arguments.length -1];'
    );
  }
  if (argumentsInArg) {
    declaredCodes.push('  const $args = $wx.detail && $wx.detail.arguments;');
  }

  let proxy = `function proxy (${injectParams.join(', ')}) {
  ${declaredCodes.join('\n')}
  with (this) {
  return (function () {
    ${functionCode};
  })();}
}`;

  proxy = vueWithTransform(proxy); // transform this
  proxy = proxy.replace('var _h=_vm.$createElement;var _c=_vm._self._c||_h;', ''); // removed unused vue code;
  if (proxy.indexOf('_vm=this') !== proxy.lastIndexOf('_vm=this')) {
    proxy = proxy.replace('var _vm=this;\n', ''); // _vm will decalred twice;
  }
  return {
    proxy: proxy,
    params: injectParams,
    parsed: parsedHandler
  };
};

/**
 * parse event handler
 * @param  {String} key   event key, e.g. tap
 * @param  {String} value event value, e.g. doSomething(item)
 * @return {Object}       parse result, e.g. {type: "bind:tap", name: "doSomething", params: ["item"]}
 */
const parseHandler = (name = '', value = '', scope) => {
  let type = '';
  let info;
  info = parseHandlerProxy(value, scope);

  if (name === 'click') name = 'tap';
  type = 'bind:' + name;
  return {
    event: name,
    type: type,
    params: info.params,
    proxy: info.proxy,
    parsed: info.parsed,
    expr: CONST.EVENT_DISPATCHER
  };
};
/*
 * parse @tap="click", v-on:tap="click"
 */
exports = module.exports = function() {
  let totalEvtCache = {}; // Global event cache

  this.register('template-parse-ast-attr-v-on.capture', function({ item, name, expr, event, scope, ctx }) {
    // bind:tap="xxx" or catch:tap="xxx"
    event.type = event.type.replace(/^bind/, 'bind').replace(/^catch/, 'catch');
    event.type = 'capture-' + event.type;
    return { item, name, expr, event, scope, ctx };
  });

  this.register('template-parse-ast-attr-v-on.stop', function({ item, name, expr, event, scope, ctx }) {
    if (event.type.startsWith('bind')) {
      // bindtap="xxx"
      event.type = event.type.replace(/^bind/, 'catch');
    } else if (event.type.indexOf('-bind') > -1) {
      // capture-bindtap="xxx"
      event.type = event.type.replace(/-bind/, '-catch');
    }
    return { item, name, expr, event, scope, ctx };
  });

  this.register('template-parse-ast-attr-v-on.wxs', function({ item, name, expr, event, scope, ctx }) {
    event.expr = `{{ ${event.parsed.callee.name} }}`;
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

  this.register('template-parse-ast-attr-v-on', function parseAstOn({ item, name, expr, modifiers, scope, ctx }) {
    let handler = expr.trim();

    let parsedEvent;

    try {
      parsedEvent = parseHandler(name, handler, scope);
    } catch (e) {
      this.hookUnique(
        'error-handler',
        'template',
        {
          code: expr,
          ctx,
          type: 'error',
          message: 'Can not parse "v-on" expression',
          title: 'v-on'
        },
        { item }
      );
      throw new Error('EXIT');
    }

    /**
     * we can recognition wxs dynamically
     * e.g:
     *
     *  <wxs module="m" lang="babel">
     *  const touchmove = (event) => {
     *    console.log('log event', JSON.stringify(event))
     *  }
     *  module.exports.touchmove = touchmove;
     *  </wxs>
     *  <template>
     *    <div class="container">
     *      <div class="userinfo" @touchmove="m.touchmove">
     *    </div>
     *    </div>
     *  </template>
     */
    const eventCallee = parsedEvent.parsed.callee;
    if (eventCallee && eventCallee.name) {
      const calleeChunks = eventCallee.name.split('.');
      const wxsBlock = ctx.sfc.wxs;

      if (
        calleeChunks.length > 1 &&
        wxsBlock &&
        Array.isArray(wxsBlock) &&
        wxsBlock.find(item => item.attrs.module === calleeChunks[0])
      ) {
        modifiers.wxs = true;

        this.hookUnique(
          'error-handler',
          'template',
          {
            ctx: ctx,
            message: `seems '${calleeChunks[0]}' is a wxs module, please manully add a  .wxs modifier for the event.`,
            type: 'warn',
            title: 'v-on'
          },
          {
            item: item,
            attr: name,
            expr: expr
          }
        );
      }
    }

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
      if (!ctx.events) {
        // generate rel
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

  this.register('template-parse-ast-attr-v-on-apply', function parseBindClass({ parsed, rel }) {
    let vOn = parsed['v-on'];

    if (!vOn.proxy) {
      return { parsed, rel };
    }

    let isComponent = !!rel.components[vOn.tag];

    if (isComponent) {
      // it is a custom defined component
      rel.on[vOn.id] = rel.on[vOn.id] || [];

      if (rel.on[vOn.id].includes(vOn.event)) {
        // Todo: repeat event
        // this.logger.warn('v-on', ``);
      } else {
        rel.on[vOn.id].push(vOn.event);
      }
    }
    if (!rel.handlers[vOn.id]) rel.handlers[vOn.id] = {};

    rel.handlers[vOn.id][vOn.event] = vOn.proxy;

    return { parsed, rel };
  });
};
