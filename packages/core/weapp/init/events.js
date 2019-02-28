import Event from '../class/Event';
import { isFunc, isUndef  } from './../util/index';

/*
 * initialize events
 */
export function initEvents (vm) {
  let parent = vm.$parent;
  let rel = parent.$rel;
  vm._events = {};
  let on = rel.info.on;
  let wpyEvt = vm.$wpyEvt;
  let evtNames = on[wpyEvt];

  evtNames.forEach(evtName => {
    vm.$on(evtName, function () {
      let fn = rel.handlers[wpyEvt][evtName];
      fn.apply(parent, arguments);
    });
  });
};
