import Watcher from './../observer/watcher';
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
      let dirty = vm.$dirty.pop();
      // TODO: optimize
      Object.keys(vm._computedWatchers || []).forEach(k => {
        dirty[k] = vm[k];
      });
      console.log(`setData[${vm.$dirty.type}]: ` + JSON.stringify(dirty));
      vm._fromSelf = true;
      vm.$wx.setData(dirty);
    }
  }, function () {

  }, null, true);
};
