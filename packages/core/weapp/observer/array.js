/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index';

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
    const result = original.apply(this, args);
    const ob = this.__ob__;
    const vm = ob.vm;

    // push parent key to dirty, wait to setData
    if (vm.$dirty)
      vm.$dirty.push(ob.key, ob.path, ob.value);

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
