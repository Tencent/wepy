import Watcher from './../observer/watcher';
import { callUserHook } from './hooks';
import { isFunc, isArr, isStr, isObj, isUndef, noop, clone  } from './../util/index';


export function resetDirty (vm) {
  vm.$dirtyKey = {};
  vm.$dirtyPath = {};
};


export function initRender (vm, keys) {
  vm._init = false;
  return new Watcher(vm, function () {
    if (!vm._init) {
      keys.forEach(key => clone(vm[key]));
      vm._init = true;
    }

    if (vm.$dirty.length()) {
      let keys = vm.$dirty.get('key');
      let dirty = vm.$dirty.pop();

      // TODO: reset subs
      Object.keys(keys).forEach(key => clone(vm[key]));

      dirty = callUserHook(vm, 'before-setData', dirty);
      vm._fromSelf = true;
      if (dirty) {
        vm.$wx.setData(dirty);
      }
    }
  }, function () {

  }, null, true);
};
