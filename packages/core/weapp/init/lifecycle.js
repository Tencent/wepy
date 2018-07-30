import WepyApp from '../class/WepyApp';
import WepyPage from '../class/WepyPage';
import WepyComponent from '../class/WepyComponent';
import { observe } from './../observer/index';
import { proxy } from './data';
import Watcher from './../observer/watcher';
import $global from './../global';
import { initProps } from './props';
import { initRender } from './render';
import { initData } from './data';
import { initComputed } from './computed';
import { initMethods } from './methods';
import { initEvents } from './events';
import { isStr, isArr, isFunc } from '../../shared/index';
import Dirty from '../class/Dirty';


let comid = 0;

const callUserMethod = function (vm, userOpt, method, args) {
  let result;
  if (isStr(method) && isFunc(userOpt[method])) {
    result = userOpt[method].apply(vm, args);
  } else if (isArr(method)) {
    for (let i = 0, l = method.length; i < l; i++) {
      if (isFunc(userOpt[method[i]])) {
        result = userOpt[method[i]].apply(vm, args);
        break;
      }
    }
  }
  return result;
};

/*
 * patch app lifecyle
 */
export function patchAppLifecycle (appConfig, option) {
  appConfig.onLaunch = function (params) {
    let vm = new WepyApp();
    vm.$option = option;

    let result;
    vm.$wx = this;
    this.$wepy = vm;
    (typeof option.onLaunch === 'function') && (result = option.onLaunch.call(vm, params));
    return result;
  };
};

export function patchComponentLifecycle (compConfig, option) {

  compConfig.created = function () {
    let vm = new WepyComponent();
    this.$wepy = vm;
    vm.$wx = this;
    vm.$id = ++comid;

    if (!vm.$app) {
      vm.$app = $global.$app;
    }

    initProps (vm, compConfig.properties, true);
  }
};

export function patchLifecycle (output, option, rel, isComponent) {

  const initClass = isComponent ? WepyComponent : WepyPage;
  const initLifecycle = function (...args) {
    let vm = new initClass();

    vm.$dirty = new Dirty('path');
    vm.$children = [];

    this.$wepy = vm;
    vm.$wx = this;
    vm.$is = this.is;
    vm.$option = option;
    vm.$rel = rel;
    if (!isComponent) {
      vm.$root = vm;
    }

    vm.$id = ++comid + (isComponent ? '.1' : '.0');
    if (!vm.$app) {
      vm.$app = $global.$app;
    }

    initProps(vm, output.properties);

    initData(vm, output.data, isComponent);

    initMethods(vm, option.methods);

    // initEvents(vm);

    vm._watchers = [];

    // create render watcher
    initRender(vm, Object.keys(vm._data));

    // not need to patch computed to ouput
    initComputed(vm, option.computed, true);

    return callUserMethod(vm, vm.$option, isComponent ? 'created' : ['onLoad', 'created'], args);
  };

  output.created = initLifecycle;
  if (isComponent) {
    output.attached = function () { // Component attached
      let outProps = output.properties || {};
      // this.propperties are includes datas
      let acceptProps = this.properties;
      let vm = this.$wepy;
      let parent = this.triggerEvent('_init', vm);

      initEvents(vm);

      Object.keys(outProps).forEach(k => vm[k] = acceptProps[k]);
    };
  } else {
    output.attached = function () { // Page attached
      // TODO: page attached
      console.log('TODO: page attached');
    }
  }

  output.ready = function () {
    // TODO: ready
    console.log('TODO: ready');
  };

  output.moved = function () {
    // TODO: moved
    console.log('TODO: moved');
  };
};

