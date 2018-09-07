import WepyApp from '../class/WepyApp';
import WepyPage from '../class/WepyPage';
import WepyComponent from '../class/WepyComponent';
import { observe } from './../observer/index';
import { proxy } from './data';
import Watcher from './../observer/watcher';
import $global from './../global';
import { initProps } from './props';
import { initWatch } from './watch';
import { initRender } from './render';
import { initData } from './data';
import { initComputed } from './computed';
import { initMethods } from './methods';
import { initEvents } from './events';
import { isStr, isArr, isFunc } from '../../shared/index';
import Dirty from '../class/Dirty';


let comid = 0;
let app;


const callUserMethod = function (vm, userOpt, method, args) {
  let result;
  let methods = userOpt[method];
  if (isFunc(methods)) {
    result = userOpt[method].apply(vm, args);
  } else if (isArr(methods)) {
    for (let i in methods) {
      if (isFunc(methods[i])) {
        result = methods[i].apply(vm, args);
      }
    }
  }
  return result;
};

/*
 * patch app lifecyle
 */
export function patchAppLifecycle (appConfig, option, rel) {
  appConfig.onLaunch = function (...args) {
    let vm = new WepyApp();
    app = vm;
    vm.$option = option;
    vm.$route = {};

    let result;
    vm.$wx = this;
    this.$wepy = vm;

    initMethods(vm, option.methods);

    return callUserMethod(vm, vm.$option, 'onLaunch', args);
  };
};

export function patchComponentLifecycle (compConfig, option) {

  compConfig.created = function () {
    let vm = new WepyComponent();
    this.$wepy = vm;
    vm.$wx = this;
    vm.$id = ++comid;

    if (!vm.$app) {
      //vm.$app = $global.$app;
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
      vm.$app = app;
    }

    vm.$id = ++comid + (isComponent ? '.1' : '.0');
    if (!vm.$app) {
      // vm.$app = $global.$app;
    }

    initProps(vm, output.properties);

    initData(vm, output.data, isComponent);

    initMethods(vm, option.methods);

    initWatch(vm, option.watch);

    // initEvents(vm);

    // create render watcher
    initRender(vm, Object.keys(vm._data).concat(Object.keys(vm._props)));

    // not need to patch computed to ouput
    initComputed(vm, option.computed, true);

    return callUserMethod(vm, vm.$option, 'created', args);
  };

  output.created = initLifecycle;
  if (isComponent) {
    output.attached = function (...args) { // Component attached
      let outProps = output.properties || {};
      // this.propperties are includes datas
      let acceptProps = this.properties;
      let vm = this.$wepy;
      let parent = this.triggerEvent('_init', vm);

      initEvents(vm);

      Object.keys(outProps).forEach(k => vm[k] = acceptProps[k]);

      return callUserMethod(vm, vm.$option, 'attached', args);
    };
  } else {
    output.attached = function (...args) { // Page attached
      let vm = this.$wepy;
      let app = vm.$app;
      let pages = getCurrentPages();
      let currentPage = pages[pages.length - 1];
      let path = currentPage.__route__;
      let webViewId = currentPage.__wxWebviewId__;
      if (app.$route.path !== path) {
        app.$route.path = path;
        app.$route.webViewId = webViewId;
        vm.routed && (vm.routed());
      }

      // TODO: page attached
      console.log('TODO: page attached');

      return callUserMethod(vm, vm.$option, 'attached', args);
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

