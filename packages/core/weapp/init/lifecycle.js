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
import { initEvents } from './events';
import { isArr, isFunc } from '../../shared/index';
import Dirty from '../class/Dirty';
import { WEAPP_APP_LIFECYCLE, WEAPP_PAGE_LIFECYCLE, WEAPP_COMPONENT_LIFECYCLE } from '../../shared/index';
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

const getLifecycycle = (defaultLifecycle, rel, type) => {
  let lifecycle = defaultLifecycle.concat([]);
  if (rel && rel.lifecycle && rel.lifecycle[type]) {
    let userDefinedLifecycle = [];
    if (isFunc(rel.lifecycle[type])) {
      userDefinedLifecycle = rel.lifecycle[type].call(null, lifecycle);
    }
    userDefinedLifecycle.forEach(u => {
      if (lifecycle.indexOf(u) > -1) {
        warn(`'${u}' is already implemented in current version, please remove it from your lifecycel config`);
      } else {
        lifecycle.push(u);
      }
    });
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
    vm.$route = {};
    vm.$rel = rel;

    vm.$wx = this;
    this.$wepy = vm;

    initHooks(vm, options.hooks);

    initMethods(vm, options.methods);

    return callUserMethod(vm, vm.$options, 'onLaunch', args);
  };

  let lifecycle = getLifecycycle(WEAPP_APP_LIFECYCLE, rel, 'app');

  lifecycle.forEach(k => {
    // it's not defined aready && user defined it && it's an array or function
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
    output.attached = function(...args) {
      // Component attached
      let outProps = output.properties || {};
      // this.propperties are includes datas
      let acceptProps = this.properties;
      let vm = this.$wepy;

      this.triggerEvent('_init', vm);

      // created 不能调用 setData，如果有 dirty 在此更新
      vm.$forceUpdate();

      initEvents(vm);

      Object.keys(outProps).forEach(k => (vm[k] = acceptProps[k]));

      return callUserMethod(vm, vm.$options, 'attached', args);
    };
  } else {
    output.attached = function(...args) {
      // Page attached
      let vm = this.$wepy;
      let app = vm.$app;
      // eslint-disable-next-line
      let pages = getCurrentPages();
      let currentPage = pages[pages.length - 1];
      let path = currentPage.__route__;
      let webViewId = currentPage.__wxWebviewId__;

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

      if (app.$route.path !== path) {
        app.$route.path = path;
        app.$route.webViewId = webViewId;
        vm.routed && vm.routed();
      }

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

    let lifecycle = getLifecycycle(WEAPP_PAGE_LIFECYCLE, rel, 'page');

    lifecycle.forEach(k => {
      if (!output[k] && options[k] && (isFunc(options[k]) || isArr(options[k]))) {
        output.methods[k] = function(...args) {
          return callUserMethod(this.$wepy, this.$wepy.$options, k, args);
        };
      }
    });
  }
  let lifecycle = getLifecycycle(WEAPP_COMPONENT_LIFECYCLE, rel, 'component');

  lifecycle.forEach(k => {
    // beforeCreate is not a real lifecycle
    if (!output[k] && k !== 'beforeCreate' && (isFunc(options[k]) || isArr(options[k]))) {
      output[k] = function(...args) {
        return callUserMethod(this.$wepy, this.$wepy.$options, k, args);
      };
    }
  });
}
