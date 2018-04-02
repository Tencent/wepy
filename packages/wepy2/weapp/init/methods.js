

export function initMethods (vm, pageConfig, methods) {
  Object.keys(methods).forEach(method => {
    pageConfig[method] = function () {
      let fn = methods[method];
      let result;

      (typeof fn === 'function') && (result = fn.call(vm));

      return result;
    }
  })
}
