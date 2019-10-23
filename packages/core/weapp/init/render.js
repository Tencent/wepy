import Watcher from './../observer/watcher';
import { callUserHook } from './hooks';
import { clone } from './../util/index';
import { renderFlushCallbacks } from './../util/next-tick';

export function resetDirty(vm) {
  vm.$dirtyKey = {};
  vm.$dirtyPath = {};
}

export function initRender(vm, keys, computedKeys) {
  vm._init = false;
  let dirtyFromAttach = null;
  return new Watcher(
    vm,
    function() {
      if (!vm._init) {
        keys.forEach(key => clone(vm[key]));
      }

      if (vm.$dirty.length() || dirtyFromAttach) {
        let keys = vm.$dirty.get('key');
        computedKeys.forEach(key => vm[key]);
        let dirty = vm.$dirty.pop();

        // TODO: reset subs
        Object.keys(keys).forEach(key => clone(vm[key]));

        if (vm._init) {
          dirty = callUserHook(vm, 'before-setData', dirty);
        }

        // vm._fromSelf = true;
        if (dirty || dirtyFromAttach) {
          // init render is in lifecycle, setData in lifecycle will not work, so cacheData is needed.
          if (!vm._init) {
            if (dirtyFromAttach === null) {
              dirtyFromAttach = {};
            }
            Object.assign(dirtyFromAttach, dirty);
          } else if (dirtyFromAttach) {
            // setData in attached
            vm.$wx.setData(Object.assign(dirtyFromAttach, dirty || {}), renderFlushCallbacks);
            dirtyFromAttach = null;
          } else {
            vm.$wx.setData(dirty, renderFlushCallbacks);
          }
        }
      }
      vm._init = true;
    },
    function() {},
    null,
    true
  );
}
