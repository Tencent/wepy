import { isFunc } from './../util/index';


export function callUserHook (vm, hookName, arg) {
  let pageHook = vm.hooks[hookName];
  let appHook = vm.$app.hooks[hookName];

  arg = isFunc(pageHook) ? pageHook.call(vm, arg) : arg;
  arg = isFunc(appHook) ? appHook.call(vm, arg) : arg;

  return arg;
}

export function initHooks(vm, hooks = {}) {
  vm.hooks = hooks;
};
