import { warn } from '../../weapp/util/index';
import { dispatcher } from '../../weapp/dispatcher/index';

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
export function patchMethods(output, methods, isComponent) {
  output.methods = {};
  let target = isComponent ? output.methods : output;

  target.__initComponent = function(e) {
    let child = e;
    var ref = e.$wx.props['data-ref'];
    var wpyEvt = e.$wx.props['data-wpy-evt'];

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
    // 支付宝组件嵌套时，子组件执行早已组件
    if (e.$children && e.$children.length) {
      e.$children.forEach(x => {
        x.$app = vm.$app;
        x.$root = vm.$root;
      });
    }
    return vm;
  };
  target.__dispatcher = dispatcher;

  // TODO: perf
  // Only orginal component method goes to target. no need to add all methods.
  if (methods) {
    Object.keys(methods).forEach(method => {
      target[method] = methods[method];
    });
  }
}
