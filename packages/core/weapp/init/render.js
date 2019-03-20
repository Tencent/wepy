import Watcher from './../observer/watcher';
import { callUserHook } from './hooks';
import { isFunc, isArr, isStr, isObj, isUndef, noop, clone  } from './../util/index';
import { nextTick } from '../util/next-tick';
import { renderFlushCallbacks } from './../util/next-tick';


export function resetDirty (vm) {
  vm.$dirtyKey = {};
  vm.$dirtyPath = {};
};


export function initRender (vm, keys) {
  vm._init = false;
  return new Watcher(vm, function () {
    if (!vm._init) {
      keys.forEach(key => clone(vm[key]));
    }

    if (vm.$dirty.length()) {
      let keys = vm.$dirty.get('key');
      let dirty = vm.$dirty.pop();

      // TODO: reset subs
      Object.keys(keys).forEach(key => clone(vm[key]));

      if (vm._init) {
        dirty = callUserHook(vm, 'before-setData', dirty);
      }

      // vm._fromSelf = true;
      if (dirty) {
        // init render is in lifecycle, setData in lifecycle will not work, so setTimeout is needed.
        if (!vm._init) {
          nextTick(function () {
            vm.$wx.setData(dirty, renderFlushCallbacks);
          })
        } else {
          vm.$wx.setData(dirty, renderFlushCallbacks);
        }
      }
    }
    vm._init = true;
  }, function () {

  }, null, true);
};
