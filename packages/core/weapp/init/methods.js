import { warn } from './../util/index';
import { dispatcher } from '../dispatcher/index';

/*
 * initialize page methods, also the app
 */
export function initMethods(vm, methods) {
  if (methods) {
    Object.keys(methods).forEach(method => {
      vm[method] = methods[method];
    });
  }
}

/*
 * patch method option
 */
export function patchMethods(output, methods) {
  output.methods = {};
  let target = output.methods;

  target._initComponent = function(e) {
    let child = e.detail;
    let { ref, wpyEvt } = e.target.dataset;
    let vm = this.$wepy;
    vm.$children.push(child);
    if (ref) {
      if (vm.$refs[ref]) {
        warn('duplicate ref "' + ref + '" will be covered by the last instance.\n', vm);
      }
      vm.$refs[ref] = child;
    }
    child.$evtId = wpyEvt;
    child.$parent = vm;
    child.$app = vm.$app;
    child.$root = vm.$root;
    return vm;
  };
  target._proxy = dispatcher;

  // TODO: perf
  // Only orginal component method goes to target. no need to add all methods.
  if (methods) {
    Object.keys(methods).forEach(method => {
      target[method] = methods[method];
    });
  }
}
