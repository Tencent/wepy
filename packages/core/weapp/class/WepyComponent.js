import Base from './Base';
import Watcher from '../observer/watcher';
import { isArr, isPlainObject } from '../../shared/index';

import { renderNextTick } from '../util/next-tick';
import Dirty from './Dirty';

export default class WepyComponent extends Base {

  constructor() {
    super();
    this.$children = [];
    this.$dirty = new Dirty('path');
    this.$refs = {};
  }
  $watch(expOrFn, cb, options) {
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
      if (typeof handler === 'string') handler = this[handler];
      return this.$watch(expOrFn, handler, options);
    }

    options = options || {};
    options.user = true;
    let watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
      cb.call(vm, watcher.value);
    }
    return function unwatchFn() {
      watcher.teardown();
    };
  }

  $forceUpdate() {
    if (this._watcher) {
      this._watcher.update();
    }
  }

  $emit(event, ...args) {
    const fns = this._events[event];

    if (fns) {
      super.$emit.apply(this, arguments);
    } else {
      this.$wx.triggerEvent(event, { arguments: args });
    }

    return this;
  }

  $trigger(event, data, option) {
    this.$wx.triggerEvent(event, { arguments: [data] }, option);
  }

  $destroy() {
    this.$children.forEach(child => {
      if (!child._detached) {
        child.$destroy();
      }
    });
    this._watcher.cleanupDeps();
    this._watcher.teardown();
    this._watchers.forEach(item => {
      item.cleanupDeps();
      item.teardown();
    });
    this._watchers = [];
    this._events = {};
    this._detached = true;
    delete this._data.__ob__;
    delete this._data;
    delete this._watcher;
    delete this.$root;
  }
}

WepyComponent.prototype.$nextTick = renderNextTick;
