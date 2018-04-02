import Watcher from './observer/watcher';
import Base from './base';
import { isPlainObject } from './util/index';
import { initData, initMethods, initLifecycle, initWatch, initComputed } from './init/index';

class WepyPage extends Base {
  $init (option) {
    let pageConfig = {};
    this.$option  = option;
    if (!option.data) {
      option.data = {};
    }

    initData(this, pageConfig, option.data);

    if (option.methods) {
      initMethods(this, pageConfig, option.methods);
    }

    this._watchers = [];

    initLifecycle(this, pageConfig);

    // Some platform has a native watch property
    if (option.watch && option.watch !== ({}).watch) {
      initWatch(this, option.watch);
    }

    if (option.computed) {
      initComputed(this, pageConfig, option.computed);
    }

    return pageConfig;
  }

  $watch (expOrFn, cb, options) {
    let vm = this;
    if (Array.isArray(cb)) {
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
}

function page (option) {
  let vm = new WepyPage();

  let pageConfig = vm.$init(option);
  return Page(pageConfig);
}


export default page;
