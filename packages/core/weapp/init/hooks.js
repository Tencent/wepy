import { isFunc, isUndef } from './../util/index';

export function callUserHook(vm, hookName, arg) {
  const pageHook = vm.hooks[hookName];
  const appHook = vm.$app.hooks[hookName];

  let result = arg;

  // First run page hook, and then run app hook
  // Pass page hook result to app hook
  // If return undefined, then return default argument
  [pageHook, appHook].forEach(fn => {
    if (isFunc(fn)) {
      result = fn.call(vm, result);
      if (isUndef(result)) {
        result = arg;
      }
    }
  });

  return result;
}

export function initHooks(vm, hooks = {}) {
  vm.hooks = hooks;
}
