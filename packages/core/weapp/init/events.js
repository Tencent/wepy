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
  let evtId = vm.$evtId;
  if (!evtId) return;

  let evtNames = on[evtId];

  evtNames.forEach(evtName => {
    vm.$on(evtName, function () {
      let fn = rel.handlers[evtId][evtName];
      fn.apply(parent, arguments);
    });
  });
};
