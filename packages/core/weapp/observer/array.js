/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import {def, hasOwn, isObject} from '../util/index'

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

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  const original = arrayProto[method];
  def(arrayMethods, method, function mutator (...args) {
    // 清除已经失效的 paths
    if (this.length > 0) {
      switch (method) {
        case 'pop':
          const len = this.length
          delInvalidPaths(len - 1, this[len - 1], this);
          break
        case 'shift':
          delInvalidPaths(0, this[0], this);
          break;
        case 'splice':
        case 'sort':
        case 'reverse':
          for (let i = 0; i < this.length; i++) {
            delInvalidPaths(i, this[i], this);
          }
      }
    }

    const result = original.apply(this, args);
    const ob = this.__ob__;
    const vm = ob.vm;

    // push parent key to dirty, wait to setData
    if (vm.$dirty) {
      if (method === 'push') {
        const lastIndex = ob.value.length - 1;
        vm.$dirty.set(ob.op, lastIndex, ob.value[lastIndex]);
      } else {
        vm.$dirty.set(ob.op, null, ob.value);
      }
    }

    // 这里和 vue 不一样，所有变异方法都需要更新 path
    ob.observeArray(ob.key, ob.value);

    // notify change
    ob.dep.notify();
    return result;
  });
});

const pickPathMap = obj => obj && obj.__ob__ && obj.__ob__.op.pathMap

function delInvalidPaths (key, value, parent) {
  if (isObject(value) && hasOwn(value, '__ob__')) {
    // delete invalid paths
    value.__ob__.op.delInvalidPaths(key, value, pickPathMap(parent))
  }
}