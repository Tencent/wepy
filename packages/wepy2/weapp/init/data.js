import { observe } from './../observer/index';
import { noop } from './../util/index';

export const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
};


export function proxy (target, sourceKey, key) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
};

export function initData (vm, pageConfig, data) {
  let instanceData = typeof data === 'function' ? data.call(vm) : data;
  vm._data = instanceData;

  vm.$dirty = [];
  Object.keys(instanceData).forEach(key => {
    proxy(vm, '_data', key);
  });

  observe(vm, instanceData, null, true);

  pageConfig.data = instanceData;

};
