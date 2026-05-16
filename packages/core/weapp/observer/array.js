/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def, hasOwn, isObject } from '../util/index';
import { cleanPaths } from './observerPath';

const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto);


function delInvalidPaths(key, value, parent) {
  if (isObject(value) && hasOwn(value, '__ob__')) {
    // delete invalid paths
    cleanPaths(key, value.__ob__.op, parent.__ob__.op);
  }
}

/**
 * WePY 数组数据绑定时，像 Vue 一样，会对 Array 原生方法进行劫持，从而达到在使用原生方法进行数组调用时，可以同时更新绑定数据
 * 但这一行为与小程序插件天然冲突，小程序插件禁止任何对原生对象的覆写。
 * 因此增加一个开关 DISABLE_ARRAY_PATCH，让业务自行决定是否进行数组原生对象劫持。
 * 若业务不做数组原生对象劫持时，那个任何数组操作，若想进行数组绑定，需要调用 wepy.$set
 */
export const patchArrayProto = () => {
  const methodsToPatch = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];

  /**
   * Intercept mutating methods and emit events
   */
  methodsToPatch.forEach(function(method) {
    // cache original method
    const original = arrayProto[method];
    def(arrayMethods, method, function mutator(...args) {
      const len = this.length;
      // 清除已经失效的 paths
      if (len > 0) {
        switch (method) {
          case 'pop':
            delInvalidPaths(len - 1, this[len - 1], this);
            break;
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
}