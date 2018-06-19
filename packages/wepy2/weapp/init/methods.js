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

const proxyHandler = function (e) {
  let vm = this.$wepy;
  let type = e.type;
  let dataset = e.currentTarget.dataset;
  let evtid = dataset.wpyEvt;
  let rel = vm.$rel || {};
  let handlers = rel.handlers ? (rel.handlers[evtid] || {}) : {};
  let fn = handlers[type];

  let i = 0;
  let params = [];
  while (i++ < 26) {
    let alpha = String.fromCharCode(64 + i);
    let key = 'wpy' + type + alpha;
    if (!dataset[key]) {
      break;
    }
    params.push(dataset[key]);
  }


  let $event = new Event(e);

  if (isFunc(fn)) {
    return fn.apply(vm, [$event].concat(params));
  } else {
    throw 'Unrecognized event';
  }
}

/*
 * initialize page methods
 */
export function initMethods (vm, methods) {
  Object.keys(methods).forEach(method => {
    vm[method] = methods[method];
  });
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

  let target = output;
  if (isComponent) {
    output.methods = {};
    target = output.methods;
  }

  target._proxy = proxyHandler;
};
