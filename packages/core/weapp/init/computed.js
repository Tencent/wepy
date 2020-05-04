import Watcher from './../observer/watcher';
import Dep from './../observer/dep';
import { sharedPropertyDefinition } from './data';

function createComputedGetter(key) {
  return function computedGetter() {
    let watcher = this._computedWatchers && this._computedWatchers[key];
    if (watcher) {
      watcher.key = key;
      if (watcher.dirty) {
        watcher.evaluate();
      }
      if (Dep.target) {
        watcher.depend();
      }
      return watcher.value;
    }
  };
}

/*
 * init computed
 */
export function initComputed(vm, computed) {
  if (!computed) {
    return;
  }
  let watchers = (vm._computedWatchers = Object.create(null));
  let computedWatcherOptions = { computed: true };

  Object.keys(computed).forEach(key => {
    let def = computed[key];
    let getter = typeof def === 'object' ? def.get : def;

    if (!getter || typeof getter !== 'function') {
      // eslint-disable-next-line
      console.error(`Getter is missing for computed property "${key}"`);
    }

    // push to dirty after dep called.
    watchers[key] = new Watcher(
      vm,
      getter || function() {},
      function() {
        // evaluate will set dirty
        // vm.$dirty.push(key, key, newv);
      },
      computedWatcherOptions
    );

    if (typeof def === 'function') {
      sharedPropertyDefinition.get = createComputedGetter(key);
      sharedPropertyDefinition.set = function() {};
    } else {
      sharedPropertyDefinition.get = def.cache !== false ? createComputedGetter(key) : def.get;
      sharedPropertyDefinition.set = def.set;
    }

    Object.defineProperty(vm, key, sharedPropertyDefinition);
  });
}
