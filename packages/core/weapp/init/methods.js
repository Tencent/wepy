import Event from '../class/Event';
import { callUserHook } from './hooks';
import { isFunc, isUndef, parseModel, warn } from './../util/index';

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
  const vm = this.$wepy;
  const type = e.type;
  // touchstart do not have currentTarget
  const dataset = (e.currentTarget || e.target).dataset;
  const evtid = dataset.wpyEvt;
  const modelId = dataset.modelId;
  const rel = vm.$rel || {};
  const handlers = rel.handlers ? (rel.handlers[evtid] || {}) : {};
  const fn = handlers[type];
  const model = rel.models[modelId];

  if (!fn && !model) {
    return;
  }

  const $event = new Event(e);

  let i = 0;
  let params = [];
  let modelParams = [];

  let noParams = false;
  let noModelParams = !model;
  while (i++ < 26 && (!noParams || !noModelParams)) {
    let alpha = String.fromCharCode(64 + i);
    if (!noParams) {
      let key = 'wpy' + type + alpha;
      if (!(key in dataset)) { // it can be undefined;
        noParams = true;
      } else {
        params.push(dataset[key]);
      }
    }
    if (!noModelParams && model) {
      let modelKey = 'model' + alpha;
      if (!(modelKey in dataset)) {
        noModelParams = true;
      } else {
        modelParams.push(dataset[modelKey]);
      }
    }
  }

  if (model) {
    if (type === model.type) {
      if (isFunc(model.handler)) {
        model.handler.call(vm, e.detail.value, modelParams);
      }
    }
  }
  if (isFunc(fn)) {
    const paramsWithEvent = params.concat($event);
    const hookRes = callUserHook(vm, 'before-event', {
      event: $event,
      params: paramsWithEvent
    });

    if (hookRes === false) { // Event cancelled.
      return;
    }
    return fn.apply(vm, params.concat($event));
  } else if (!model) {
    throw new Error('Unrecognized event');
  }
}

/*
 * initialize page methods, also the app
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

  output.methods = {};
  let target = output.methods;

  target._initComponent = function (e) {
    let child = e.detail;
    let { ref, wpyEvt } = e.target.dataset;
    let vm = this.$wepy;
    vm.$children.push(child);
    if (ref) {
      if (vm.$refs[ref]) {
        warn(
          'duplicate ref "' + ref +
          '" will be covered by the last instance.\n',
          vm
        )
      }
      vm.$refs[ref] = child;
    }
    child.$evtId = wpyEvt;
    child.$parent = vm;
    child.$app = vm.$app;
    child.$root = vm.$root;
    return vm;
  };
  target._proxy = proxyHandler;

  // TODO: perf
  // Only orginal component method goes to target. no need to add all methods.
  if (methods) {
    Object.keys(methods).forEach(method => {
      target[method] = methods[method];
    });
  }
};
