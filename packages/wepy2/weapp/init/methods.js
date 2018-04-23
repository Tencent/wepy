/*
 * initialize page methods
 */
export function initMethods (vm, pageConfig, methods) {
  Object.keys(methods).forEach(method => {
    pageConfig[method] = function () {
      let fn = methods[method];
      let result;

      (typeof fn === 'function') && (result = fn.call(vm));

      return result;
    };
  });
};

/*
 * initialize component methods
 */
export function initComponentMethods (comConfig, methods) {

  comConfig.methods = {};
  Object.keys(methods).forEach(method => {

    comConfig.methods[method] = function () {
      let fn = methods[method];
      let result;

      (typeof fn === 'function') && (result === fn.call(this.$wepy));

      return result;
    };

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
    target[method] = function () {
      let fn = methods[method];
      let result;

      (typeof fn === 'function') && (result = fn.call(this.$wepy));

      return result;
    }
  });
};
