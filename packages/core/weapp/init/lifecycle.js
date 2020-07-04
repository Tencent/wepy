import WepyApp from '../class/WepyApp';
import WepyPage from '../class/WepyPage';
import WepyComponent from '../class/WepyComponent';
import { initHooks } from './hooks';
import { initProps } from './props';
import { initWatch } from './watch';
import { initRender } from './render';
import { initData } from './data';
import { initComputed } from './computed';
import { initMethods } from './methods';
import { isArr, isFunc, isStr } from '../../shared/index';
import Dirty from '../class/Dirty';
import {
  WEAPP_APP_LIFECYCLE,
  WEAPP_PAGE_LIFECYCLE,
  WEAPP_COMPONENT_LIFECYCLE,
  WEAPP_COMPONENT_PAGE_LIFECYCLE
} from '../../shared/index';
import { warn } from '../util/index';

let comid = 0;
let app;

const callUserMethod = function(vm, userOpt, method, args) {
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

export const getLifeCycle = (defaultLifecycle, rel, type) => {
  let lifecycle = defaultLifecycle.concat([]);
  if (rel && rel.lifecycle && rel.lifecycle[type]) {
    let userDefinedLifecycle = [];
    const modifiedLifeCycles = rel.lifecycle[type];

    if (isStr(modifiedLifeCycles) || isArr(modifiedLifeCycles)) {
      userDefinedLifecycle = userDefinedLifecycle.concat(modifiedLifeCycles);
      userDefinedLifecycle.forEach(u => {
        if (lifecycle.indexOf(u) > -1) {
          warn(`'${u}' is already implemented in current version, please remove it from your lifecycle config`);
        } else {
          lifecycle.push(u);
        }
      });
    } else if (isFunc(modifiedLifeCycles)) {
      lifecycle = modifiedLifeCycles.call(null, lifecycle);
    }
  }
  return lifecycle;
};

/*
 * patch app lifecyle
 */
export function patchAppLifecycle(appConfig, options, rel = {}) {
  appConfig.onLaunch = function(...args) {
    let vm = new WepyApp();
    app = vm;
    vm.$options = options;
    vm.$route = null; // default route is null
    vm.$rel = rel;

    vm.$wx = this;
    this.$wepy = vm;

    initHooks(vm, options.hooks);

    initMethods(vm, options.methods);

    return callUserMethod(vm, vm.$options, 'onLaunch', args);
  };

  let lifecycle = getLifeCycle(WEAPP_APP_LIFECYCLE, rel, 'app');

  lifecycle.forEach(k => {
    // it's not defined already && user defined it && it's an array or function
    if (!appConfig[k] && options[k] && (isFunc(options[k]) || isArr(options[k]))) {
      appConfig[k] = function(...args) {
        return callUserMethod(app, app.$options, k, args);
      };
    }
  });
}

export function patchLifecycle(output, options, rel, isComponent) {
  const initClass = isComponent ? WepyComponent : WepyPage;
  const initLifecycle = function(...args) {
    let vm = new initClass();

    vm.$dirty = new Dirty('path');
    vm.$children = [];
    vm.$refs = {};

    this.$wepy = vm;
    vm.$wx = this;
    vm.$is = this.is;
    vm.$options = options;
    vm.$rel = rel;
    vm._watchers = [];
    if (!isComponent) {
      vm.$root = vm;
    }
    if (app) {
      vm.$app = app;
    }
    if (this.is === 'custom-tab-bar/index') {
      vm.$app = app;
      vm.$parent = app;
    }

    vm.$id = ++comid + (isComponent ? '.1' : '.0');
    if (!vm.$app) {
      // vm.$app = $global.$app;
    }

    callUserMethod(vm, vm.$options, 'beforeCreate', args);

    initHooks(vm, options.hooks);

    initProps(vm, output.properties);

    initData(vm, output.data, isComponent);

    initMethods(vm, options.methods);

    initComputed(vm, options.computed, true);

    initWatch(vm, options.watch);

    // create render watcher
    initRender(
      vm,
      Object.keys(vm._data)
        .concat(Object.keys(vm._props))
        .concat(Object.keys(vm._computedWatchers || {})),
      Object.keys(vm._computedWatchers || {})
    );

    return callUserMethod(vm, vm.$options, 'created', args);
  };

  output.created = initLifecycle;
  if (isComponent) {
    patchComponentLifecycle(output, options, rel);
  } else {
    patchPageLifecycle(output, options, rel);
  }

  // Common patch
  let lifecycle = getLifeCycle(WEAPP_COMPONENT_LIFECYCLE, rel, 'component');

  lifecycle.forEach(k => {
    // beforeCreate is not a real lifecycle
    if (!output[k] && k !== 'beforeCreate' && (isFunc(options[k]) || isArr(options[k]))) {
      output[k] = function(...args) {
        return callUserMethod(this.$wepy, this.$wepy.$options, k, args);
      };
    }
  });
}

/**
 * Patch component life cycle
 * @param {*} output patch output
 * @param {*} options patch options
 * @param {*} rel patch rel
 */
function patchComponentLifecycle(output, options, rel) {
  output.attached = function(...args) {
    // Component attached
    let outProps = output.properties || {};
    // this.propperties are includes datas
    let acceptProps = this.properties;
    let vm = this.$wepy;

    this.triggerEvent('_init', vm);

    // created 不能调用 setData，如果有 dirty 在此更新
    vm.$forceUpdate();

    Object.keys(outProps).forEach(k => (vm[k] = acceptProps[k]));

    return callUserMethod(vm, vm.$options, 'attached', args);
  };

  // 增加组件页面声明周期
  output.pageLifetimes = {};
  const lifecycle = getLifeCycle(WEAPP_COMPONENT_PAGE_LIFECYCLE, rel, 'component');

  lifecycle.forEach(function(k) {
    if (!output.pageLifetimes[k] && options[k] && (isFunc(options[k]) || isArr(options[k]))) {
      output.pageLifetimes[k] = function(...args) {
        return callUserMethod(this.$wepy, this.$wepy.$options, k, args);
      };
    }
  });
}

/**
 * Patch Page Life cycle
 * @param {*} output patch output
 * @param {*} options patch options
 * @param {*} rel rel
 */
function patchPageLifecycle(output, options, rel) {
  output.attached = function(...args) {
    // Page attached
    let vm = this.$wepy;
    let app = vm.$app;

    let refs = rel.refs || [];
    let query = wx.createSelectorQuery();

    refs.forEach(item => {
      // {
      //   id: { name: 'hello', bind: true },
      //   ref: { name: 'value', bind: false }
      // }
      let idAttr = item.id;
      let refAttr = item.ref;
      let actualAttrIdName = idAttr.name;
      let actualAttrRefName = refAttr.name;
      let selector = `#${actualAttrIdName}`;

      if (idAttr.bind) {
        // if id is a bind attr
        actualAttrIdName = vm[idAttr.name];
        selector = `#${actualAttrIdName}`;
        vm.$watch(idAttr.name, function(newAttrName) {
          actualAttrIdName = newAttrName;
          selector = `#${actualAttrIdName}`;
          vm.$refs[actualAttrRefName] = query.select(selector);
        });
      }

      if (refAttr.bind) {
        // if ref is a bind attr
        actualAttrRefName = vm[refAttr.name];

        vm.$watch(refAttr.name, function(newAttrName, oldAttrName) {
          actualAttrRefName = newAttrName;
          vm.$refs[oldAttrName] = null;
          vm.$refs[newAttrName] = query.select(selector);
        });
      }
      vm.$refs[actualAttrRefName] = query.select(selector);
    });

    // created 不能调用 setData，如果有 dirty 在此更新
    vm.$forceUpdate();

    // TODO: page attached
    return callUserMethod(vm, vm.$options, 'attached', args);
  };
  // Page lifecycle will be called under methods
  // e.g:
  // Component({
  //   methods: {
  //     onLoad () {
  //       console.log('page onload')
  //     }
  //   }
  // })

  // Patch routed method
  patchRouted(output);

  let lifecycle = getLifeCycle(WEAPP_PAGE_LIFECYCLE, rel, 'page');

  lifecycle.forEach(k => {
    if (!output[k] && options[k] && (isFunc(options[k]) || isArr(options[k]))) {
      // onShow is patched in routed method
      if (k !== 'onShow') {
        output.methods[k] = function(...args) {
          return callUserMethod(this.$wepy, this.$wepy.$options, k, args);
        };
      }
    }
  });
}
/**
 * Add routed method for user.
 * @param {*} output patch output
 */
function patchRouted(output) {
  output.methods.onShow = function(...args) {
    // Page attached
    let vm = this.$wepy;
    let app = vm.$app;
    // eslint-disable-next-line
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const path = currentPage.__route__ || currentPage.route;
    const webViewId = currentPage.__wxWebviewId__;

    if (!app.$route || app.$route.path !== path) {
      const oldRoute = app.$route;
      const newRoute = {
        path,
        webViewId,
        page: currentPage,
        query: currentPage.options
      };
      app.$route = newRoute;
      callUserMethod(vm, vm.$options, 'routed', [oldRoute, newRoute]);
    }
  };
}
