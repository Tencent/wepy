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
    return fn.apply(this.$wepy, args);
  };
};

/*
 * initialize page methods
 */
export function initMethods (vm, pageConfig, methods) {
  Object.keys(methods).forEach(method => {
    pageConfig[method] = eventHandler(method, methods[method]);
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

  Object.keys(methods).forEach(method => {
    target[method] = eventHandler(method, methods[method]);
  });
};
