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
  for (let event in on) {
    let index = on[event];
    vm.$on(event, function () {
      let fn = rel.handlers[index][event];
      fn.apply(parent, arguments);
    });
  }
};

