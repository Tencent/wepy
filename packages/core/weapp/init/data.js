import { observe } from '../observer/index';
import { pushTarget, popTarget } from '../observer/dep';
import { noop, isFunc, isPlainObject } from '../../shared/index';
import { handleError, warn } from '../util/index';

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
export function patchData (output, data, vm) {
  output.data = isFunc(data)
    ? getData(vm, data)
    : data || {};

  if (!isPlainObject(output.data)) {
    warn(
      'data functions should return an object:\n' +
      vm
    )
  }
};

/*
 * init data
 */
export function initData (vm, data, output) {
  let _data = data || {};
  vm._data = _data;
  Object.keys(_data).forEach(key => {
    proxy(vm, '_data', key);
  });

  observe({
    vm: vm,
    key: '',
    value: _data,
    parent: '',
    root: true
  });
  //observe(vm, _data, null, true);
};

export function getData (vm, data) {
  // disable dep collection when invoking data getters
  pushTarget();
  try {
    return data.call(vm, vm);
  } catch (e) {
    handleError(e, vm, 'data()');
    return {};
  } finally {
    popTarget();
  }
};
