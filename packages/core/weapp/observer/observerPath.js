/**
 * @desc ObserverPath 类
 * Observer 所在位置对应在整棵 data tree 的路径集合
 * @createDate 2019-07-21
 */

import {hasOwn, isNum, isObject} from '../util/index'

export default class ObserverPath {
  constructor (key, parent, observer) {
    this.observer = observer;
    this.pathMap = this.getPathMap(key, parent && parent.__ob__.observerPath);
  }

  /**
   * 将要更新的数据放入 dirty
   * 其中 key 为空串时，表示其路径是自身，否则是其子节点
   */
  setDirty (key, value, dirty) {
    const pathMap = key ? this.getPathMap(key, this) : this.pathMap;
    const keys = Object.keys(pathMap);
    for (let i = 0; i < keys.length; i++) {
      const {root, path} = pathMap[keys[i]];
      if (this.hasPath(path, this.observer.vm)) {
        dirty.push(root, path, value);
      } else {
        delete pathMap[keys[i]];
      }
    }
  }

  /**
   * 更新 __ob__ 的 path
   */
  traverseUpdatePath (key, value, parent) {
    // 得到此 value 挂载到 parent 的 pathMap
    const pathMap = this.getPathMap(key, parent && parent.__ob__.observerPath);
    const keys = Object.keys(pathMap);

    // 遍历 pathMap
    for (let i = 0; i < keys.length; i++) {
      const {root, path} = pathMap[keys[i]];

      // 判断 path 是否存在，如果不存在则新增一条 path
      if (!(path in this.pathMap)) {
        this.pathMap[path] = {key, root, path};

        // 深度遍历更新路径
        let keys;
        if (Array.isArray(value)) {
          keys = Array.from(Array(value.length), (val, index) => index);
        } else {
          keys = Object.keys(value);
        }
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (isObject(value[key]) && hasOwn(value[key], '__ob__')) {
            value[key].__ob__.observerPath.traverseUpdatePath(key, value[key], value, this.observer.vm);
          }
        }

        // 清除不存在的路径
        keys = Object.keys(this.pathMap);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (!this.propPathEq(this.pathMap[key].path, value, this.observer.vm)) {
            delete this.pathMap[key];
          }
        }
      }
    }
  }

  /**
   * 得到父路径集合和子节点组合后的路径集合
   */
  getPathMap (key, parentObserverPath) {
    if (parentObserverPath) {
      const parentPathMap = parentObserverPath.pathMap;
      const setPath = isNum(key) ? path => `${path}[${key}]` : path => `${path}.${key}`;
      let pathMap = {};
      const keys = Object.keys(parentPathMap)
      for (let i = 0; i < keys.length; i++) {
        if (parentPathMap[keys[i]].path) {
          const path = setPath(parentPathMap[keys[i]].path);
          let root = '';
          for (let j = 0; (j < path.length) && (path[j] !== '.' && path[j] !== '['); j++) {
            root += path[j];
          }
          pathMap[path] = {key, root, path};
        } else {
          pathMap[key] = {key, root: key, path: key}
        }
      }
      return pathMap;
    }
    return {[key]: {key, root: key, path: key}};
  }

  /**
   * 比较 obj 指定 path 上的值与 value 是否相等
   */
  propPathEq (path, value, obj) {
    let objValue = obj;
    let key = '';
    let i = 0;
    while (i < path.length) {
      if (path[i] !== '.' && path[i] !== '[' && path[i] !== ']') {
        key += path[i];
      } else if (key.length !== 0) {
        objValue = objValue[key];
        key = '';
        if (!isObject(objValue)) {
          return false;
        }
      }
      i++;
    }
    if (key.length !== 0) {
      objValue = objValue[key];
    }
    return value === objValue;
  }

  /**
   * obj 上是否存在此 path
   */
  hasPath (path, obj) {
    let value = obj;
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
}
