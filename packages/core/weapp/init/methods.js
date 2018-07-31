import Event from '../class/Event';
import { isFunc, isUndef  } from './../util/index';

const eventHandler = function (method, fn) {
  let methodKey = method.toLowerCase();
  return function (e, ...args) {
    if (!isFunc(fn)) {
      throw 'undefined method: ' + method;
    }
    let result;
    let wepyParams = [];
    let paramsLength = 0;
    let p;
    if (e.currentTarget && e.currentTarget.dataset) {
      let tmp = e.currentTarget.dataset;
      while(!isUndef(tmp['wpy' + methodKey + (p = String.fromCharCode(65 + paramsLength++))])) {
        wepyParams.push(tmp['wpy' + methodKey + p]);
      }
    }
    args = args.concat(wepyParams);
    $event = new Event(e);
    return fn.apply(this.$wepy, [$event].concat(args));
  };
};

const modelHandler = function (vm, model, e) {
  // TODO: support test.abc & test[0]["abc"]
  vm[model.expr] = e.detail.value;
}

const proxyHandler = function (e) {
  let vm = this.$wepy;
  let type = e.type;
  let dataset = e.currentTarget.dataset;
  let evtid = dataset.wpyEvt;
  let rel = vm.$rel || {};
  let handlers = rel.handlers ? (rel.handlers[evtid] || {}) : {};
  let fn = handlers[type];

  if (rel.info.model && type === rel.info.model.type) {
    modelHandler(vm, rel.info.model, e);

    if (!fn) {
      return;
    }
  }

  let i = 0;
  let params = [];
  while (i++ < 26) {
    let alpha = String.fromCharCode(64 + i);
    let key = 'wpy' + type + alpha;
    if (!(key in dataset)) { // it can be undefined;
      break;
    }
    params.push(dataset[key]);
  }

  let $event = new Event(e);

  if (isFunc(fn)) {
    if (fn.name === 'proxyHandlerWithEvent') {
      return fn.apply(vm, params.concat($event));
    } else {
      return fn.apply(vm, params);
    }
  } else {
    throw new Error('Unrecognized event');
  }
}

/*
 * initialize page methods
 */
export function initMethods (vm, methods) {
  if (methods) {
    Object.keys(methods).forEach(method => {
      vm[method] = methods[method];
    });
  }
};

/*
 * initialize component methods
 */
export function initComponentMethods (comConfig, methods) {

  comConfig.methods = {};
  Object.keys(methods).forEach(method => {
    comConfig[method] = eventHandler(method, methods[method]);
  });
};

/*
 * patch method option
 */
export function patchMethods (output, methods, isComponent) {
  if (!methods) {
    return;
  }

  output.methods = {};
  let target = output.methods;

  target._initComponent = function (e) {
    let child = e.detail;
    let vm = this.$wepy;
    vm.$children.push(child);
    child.$parent = vm;
    child.$app = vm.$app;
    child.$root = vm.$root;
    return vm;
  };
  target._proxy = proxyHandler;
};
