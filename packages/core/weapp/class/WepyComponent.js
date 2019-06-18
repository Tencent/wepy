import Base from './Base';
import Watcher from '../observer/watcher';
import { isArr, isPlainObject } from '../../shared/index';

import { renderNextTick } from '../util/next-tick';

export default class WepyComponent extends Base {
  $watch (expOrFn, cb, options) {
    let vm = this;
    if (isArr(cb)) {
      cb.forEach(handler => {
        this.$watch(expOrFn, handler, options);
      });
    }
    if (isPlainObject(cb)) {
      let handler = cb;
      options = handler;
      handler = handler.handler;
      if (typeof handler === 'string')
        handler = this[handler];
      return this.$watch(expOrFn, handler, options);
    }

    options = options || {};
    options.user = true;
    let watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn () {
      watcher.teardown();
    }
  }
};

WepyComponent.prototype.$nextTick = renderNextTick;


