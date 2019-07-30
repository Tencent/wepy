/**
 * @desc ObserverPath 类
 * Observer 所在位置对应在整棵 data tree 的路径集合
 * @createDate 2019-07-21
 */

import { hasOwn, isNum, isObject } from '../util/index'

const setPath = (key, path) => {
  return isNum(key)
    ? `${path}[${key}]`
    : `${path}.${key}`;
}

export default class ObserverPath {
  constructor (key, parent, observer) {
    this.observer = observer;
    this.pathMap = parent && parent.__ob__ && parent.__ob__.op
      ? parent.__ob__.op.getPathMap(key)
      : ( key
        ? { [key] : {key, root: key, path: key} }
        : {}
      );
  }

  /**
   * 更新 __ob__ 的 path
   */
  traverseUpdatePath (key, value, parent) {
    // 得到此 value 挂载到 parent 的 pathMap
    const pathMap = parent && parent.__ob__ && parent.__ob__.op
      ? parent.__ob__.op.getPathMap(key)
      : ( key
        ? { [key] : {key, root: key, path: key} }
        : {}
      );
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
            value[key].__ob__.op.traverseUpdatePath(key, value[key], value.__ob__.vm);
          }
        }

        // 清除不存在的路径
        keys = Object.keys(this.pathMap);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          if (!this.observer.isPathEq(key, value)) {
            delete this.pathMap[key];
          }
        }
      }
    }
  }

  /**
   * 得到父路径集合和子节点组合后的路径集合
   */
  getPathMap (key) {
    const parentPathMap = this.pathMap;
    let pathMap = {};
    const keys = Object.keys(parentPathMap)
    if (keys.length) {
      for (let i = 0; i < keys.length; i++) {
        if (parentPathMap[keys[i]].path) {
          const path = setPath(key, parentPathMap[keys[i]].path);
          let root = '';
          for (let j = 0; (j < path.length) && (path[j] !== '.' && path[j] !== '['); j++) {
            root += path[j];
          }
          pathMap[path] = {key, root, path};
        } else {
          pathMap[key] = {key, root: key, path: key}
        }
      }
    } else {
      pathMap[key] = {key, root: key, path: key}
    }
    return pathMap;
  }
}
