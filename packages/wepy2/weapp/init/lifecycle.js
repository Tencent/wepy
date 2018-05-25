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
import { isStr, isArr, isFunc } from '../../shared/index';


let comid = 0;

const callUserMethod = function (vm, userOpt, method, args) {
  let result;
  if (isStr(method) && isFunc(userOpt[method])) {
    result = userOpt[method].apply(vm, args);
  } else if (isArr(method)) {
    for (let i = method, l = method.length; i < l; i++) {
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

export function initLifecycle_bak (vm, pageConfig) {
  pageConfig.onLoad = function () {
    let wxpage = this;
    vm.$wxpage = wxpage;

    if (!vm.$app) {
      vm.$app = $global.$app;
    }

    let init = false;

    vm.$dirty = {};
    let renderWatcher = new Watcher(vm, function () {
      if (!init) {
        for (let k in vm._data) {
          // initialize getter dep
          vm._data[k];
        }
        init = true;
      }

      if (vm.$dirty.length) {
        let dirtyData = {};
        vm.$dirty.concat(Object.keys(vm._computedWatchers || {})).forEach(k => {
          dirtyData[k] = vm[k];
        });
        vm.$dirty = {};
        wxpage.setData(dirtyData);
      }
    }, function () {

    }, null, true);

    let result;
    (typeof vm.$option.onLoad === 'function') && (result = vm.$option.onLoad.call(vm));
    return result;
  }
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

    this.$wepy = vm;
    vm.$wx = this;
    vm.$is = this.is;
    vm.$option = option;
    vm.$rel = rel;

    vm.$id = ++comid + (isComponent ? '.1' : '.0');
    if (!vm.$app) {
      vm.$app = $global.$app;
    }

    initProps(vm, output.properties);

    initData(vm, output.data, isComponent);

    initMethods(vm, option.methods);

    vm._watchers = [];

    // create render watcher
    initRender(vm, Object.keys(vm._data));

    // not need to patch computed to ouput
    initComputed(vm, option.computed, true);

    return callUserMethod(vm, vm.$option, isComponent ? 'created' : ['onLoad', 'created'], args);
  };

  if (isComponent) {
    output.created = initLifecycle;
    output.attached = function () {
      console.log('attached');
      console.log(this);
      let outProps = output.properties;
      // this.propperties are includes datas
      let acceptProps = this.properties;
      let vm = this.$wepy;
      Object.keys(outProps).forEach(k => vm[k] = acceptProps[k]);
    };
  } else {
    output.onLoad = initLifecycle;
  }

  output.ready = function () {
    console.log('ready');
    console.log(this);
  };

  output.moved = function () {
    console.log('moved');
    console.log(this);
  };
};

