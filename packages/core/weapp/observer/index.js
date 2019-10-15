import Dep from './dep';
import ObserverPath, { addPaths, cleanPaths, pickOp } from './observerPath'
import { arrayMethods } from './array'
import {
  def,
  warn,
  hasOwn,
  hasProto,
  isObject,
  isPlainObject,
  isValidArrayIndex
} from '../util/index'

const arrayKeys = Object.getOwnPropertyNames(arrayMethods);

/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
export const observerState = {
  shouldConvert: true
}

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
export class Observer {

  /**
   * @param root 根节点
   * @param parent 父节点
   * @param key 当前节点的 key
   * @param value
   * @param dirty Dirty 对象
   */
  constructor ({root, parent, key, value, dirty}) {
    this.root = root;
    this.value = value
    this.dirty = dirty
    this.dep = new Dep()
    if (dirty) {
      this.op = new ObserverPath(key, this, pickOp(parent))
    }
    this.vmCount = 0;

    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      const augment = hasProto
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value, dirty);
    } else {
      this.walk(value, dirty);
    }
  }

  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive({ root: this.root, parent: obj, key: keys[i], dirty: this.dirty });
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe({ root: this.root, parent: items, key: i, value: items[i], dirty: this.dirty });
    }
  }

  /**
   * Check if path exsit in vm
   */
  hasPath (path) {
    let value = this.root;
    let key = '';
    let i = 0;
    while (i < path.length) {
      if (path[i] !== '.' && path[i] !== '[' && path[i] !== ']') {
        key += path[i];
      } else if (key.length !== 0) {
        value = value[key];
        key = '';
        if (!isObject(value)) {
          return false;
        }
      }
      i++;
    }
    return true;
  }

  /**
   * Is this path value equal
   */
  isPathEq (path, destValue) {
    let value = this.root;
    let key = '';
    let i = 0;
    while (i < path.length) {
      if (path[i] !== '.' && path[i] !== '[' && path[i] !== ']') {
        key += path[i];
      } else if (key.length !== 0) {
        value = value[key];
        key = '';
        if (!isObject(value)) {
          return false;
        }
      }
      i++;
    }
    if (key.length !== 0) {
      value = value[key];
    }
    return value === destValue;
  }
}

// helpers

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src, keys) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 * @param root 根节点
 * @param parent 父节点
 * @param key 当前节点的 key
 * @param value
 * @param dirty Dirty 对象
 * @param asRoot 是否为根节点
 * @return {*}
 */
export function observe ({root, parent, key, value, dirty = null, asRoot = false}) {
  if (!isObject(value)) {
    return
  }
  let ob;
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__;
    dirty && addPaths(key, ob.op, parent.__ob__.op);
  } else if (
    observerState.shouldConvert &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    ob = new Observer({root, parent, key, value, dirty});
  }
  if (asRoot && ob) {
    ob.vmCount++;
  }
  return ob
}

/**
 * Define a reactive property on an Object.
 */
export function defineReactive ({root, parent, key, value, dirty, customSetter, shallow}) {
  const dep = new Dep()

  const property = Object.getOwnPropertyDescriptor(parent, key)
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set
  if ((!getter || setter) && value === undefined) {
    value = parent[key]
  }

  let childOb = !shallow && observe({root, parent, key, value, dirty});
  Object.defineProperty(parent, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      const val = getter ? getter.call(parent) : value
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
          if (Array.isArray(val)) {
            dependArray(val)
          }
        }
      }
      return val
    },
    set: function reactiveSetter (newValue) {
      const val = getter ? getter.call(parent) : value
      /* eslint-disable no-self-compare */
      if (newValue === val || (newValue !== newValue && val !== val)) {
        return
      }

      /* eslint-enable no-self-compare */
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }

      if (getter && !setter) return

      const op = pickOp(value)
      if (op) {
        /**
         * 删掉无效的 paths
         * 注意：即使 path 只有一个也要删掉，因为其子节点可能有多个 path
         */
        cleanPaths(key, value.__ob__.op, parent.__ob__.op);
      }

      if (setter) {
        setter.call(parent, newValue)
      } else {
        value = newValue
      }

      // Have to set dirty after value assigned, otherwise the dirty key is incrrect.
      if (dirty) {
        // push parent key to dirty, wait to setData
        dirty.set(parent.__ob__.op, key, newValue);
      }
      childOb = !shallow && observe({root, parent, key, value: newValue, dirty});
      dep.notify();
    }
  })
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
export function set (root, target, key, value) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.length = Math.max(target.length, key)
    target.splice(key, 1, value)
    return value;
  }

  if (key in target && !(key in Object.prototype)) {
    target[key] = value
    return value
  }

  const ob = (target).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return value
  }

  if (!ob) {
    target[key] = value
    return value
  }

  if (isObject(target[key]) && hasOwn(target[key], '__ob__') && ob.dirty) {
    // delete invalid paths
    cleanPaths(key, target[key].__ob__.op, ob.op);
  }
  defineReactive({root, parent: ob.value, key, value, dirty: ob.dirty});
  if (ob.dirty) {
    // push parent key to dirty, wait to setData
    ob.dirty.set(ob.op, key, value);
  }
  ob.dep.notify()
  return value
}

/**
 * Delete a property and trigger change if necessary.
 */
export function del (target, key) {
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    target.splice(key, 1)
    return
  }

  const ob = (target).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }

  if (!hasOwn(target, key)) {
    return
  }

  // set $dirty
  target[key] = null;
  delete target[key]
  if (!ob) {
    return
  }
  ob.dep.notify()
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}
