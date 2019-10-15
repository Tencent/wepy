import { observe } from './../observer/index';
import { noop, clone } from './../../shared/index';

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

/*
 * patch data option
 */
export function patchData (output, data) {
  if (!data) {
    data = {};
  }
  output.data = data;
};


/*
 * init data
 */
export function initData (vm, data) {
  if (!data) {
    data = {};
  }
  let _data;
  if (typeof data === 'function') {
    _data = data.call(vm);
  } else {
    _data = clone(data);
  }
  vm._data = _data;
  Object.keys(_data).forEach(key => {
    proxy(vm, '_data', key);
  });

  observe({
    root: vm,
    value: vm._data,
    dirty: vm.$dirty,
    asRoot: true
  });
}
