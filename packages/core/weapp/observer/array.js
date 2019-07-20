/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import {def, isObject} from '../util/index'

const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto);

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
];

export const hasPath = (path, obj) => {
  let value = obj;
  let key = '';
  let i = 0;
  while (i < path.length) {
    if (path[i] !== '.' && path[i] !== '[' && path[i] !== ']') {
      key += path[i];
    } else if (key.length !== 0) {
      value = value[key];
      key = '';
      if (!isObject(value)) {
        return false
      }
    }
    i++;
  }
  return true
};

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method];
  def(arrayMethods, method, function mutator (...args) {
    const result = original.apply(this, args);
    const ob = this.__ob__;
    const vm = ob.vm;

    // push parent key to dirty, wait to setData
    if (vm.$dirty) {
      const keys = Object.keys(ob.pathMap)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const {root, path} = ob.pathMap[key];
        if (hasPath(path, vm)) {
          vm.$dirty.push(root, path, ob.value);
        } else {
          delete ob.pathMap[key]
        }
      }
    }

    let isInserted = false;
    switch (method) {
      case 'push':
      case 'unshift':
        isInserted = true;
        break;
      case 'splice':
        isInserted = true;
        break;
    }
    if (isInserted) ob.observeArray(ob.key, ob.value);
    // notify change
    ob.dep.notify();
    return result;
  });
});
