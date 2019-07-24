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
  let cacheData = null
  return new Watcher(vm, function () {
    if (!vm._init) {
      keys.forEach(key => clone(vm[key]));
    }

    if (vm.$dirty.length() || cacheData) {
      let keys = vm.$dirty.get('key');
      let dirty = vm.$dirty.pop();

      // TODO: reset subs
      Object.keys(keys).forEach(key => clone(vm[key]));

      if (vm._init) {
        dirty = callUserHook(vm, 'before-setData', dirty);
      }

      // vm._fromSelf = true;
      if (dirty || cacheData) {
        // init render is in lifecycle, setData in lifecycle will not work, so cacheData is needed.
        if (!vm._init) {
          if (cacheData === null) {
            cacheData = {}
          }
          Object.assign(cacheData, dirty)
        } else if (cacheData) {  // setData in attached
          vm.$wx.setData(Object.assign(cacheData, dirty || {}), renderFlushCallbacks);
          cacheData = null
        } else {
          vm.$wx.setData(dirty, renderFlushCallbacks);
        }
      }
    }
    vm._init = true;
  }, function () {

  }, null, true);
};
