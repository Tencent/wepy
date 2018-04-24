import Watcher from './../observer/watcher';
import Dep from './../observer/dep';
import { noop } from './../util/index';
import { sharedPropertyDefinition } from './data';


function createComputedGetter (key) {
  return function computedGetter () {
    let watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    }
  }
}

/*
 * init computed
 */
export function initComputed (vm, computed) {
  if (!computed) {
    return;
  }
  let watchers = vm._computedWatchers = Object.create(null);
  let computedWatcherOptions = { lazy: true };

  Object.keys(computed).forEach(key => {
    let def = computed[key];
    let getter = typeof def === 'object' ? def.get : def;

    if (!getter || typeof getter !== 'function') {
      console.error(`Getter is missing for computed property "${key}"`)
    }

    watchers[key] = new Watcher(vm, getter || function () {}, function () {}, computedWatcherOptions);

    if (typeof def === 'function') {
      sharedPropertyDefinition.get = createComputedGetter(key);
      sharedPropertyDefinition.set = function () {};
    } else {
      sharedPropertyDefinition.get = def.cache !== false ? createComputedGetter(key) : def.get;
      sharedPropertyDefinition.set = def.set;
    }

    Object.defineProperty(vm, key, sharedPropertyDefinition);
  })
};
