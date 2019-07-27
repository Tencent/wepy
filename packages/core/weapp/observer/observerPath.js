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

const pickPathMap = obj => obj && obj.__ob__ && obj.__ob__.op.pathMap

export default class ObserverPath {
  constructor (key, parent, ob) {
    this.observer = ob;
    this.pathMap = ObserverPath.getPathMap(key, pickPathMap(parent));
  }

  /**
   * 添加新的 __ob__ 的 path
   */
  traverseAddPath (key, value, parentPathMap) {
    // 得到此 value 挂载到 parent 的 pathMap
    const pathMap = ObserverPath.getPathMap(key, parentPathMap);
    const keys = Object.keys(pathMap);
    let newPathMap = {};

    // 遍历 pathMap
    for (let i = 0; i < keys.length; i++) {
      const {root, path} = pathMap[keys[i]];
      if (!(path in this.pathMap)) {
        // 新增一条 path
        newPathMap[path] = {key, root, path};
        this.pathMap[path] = newPathMap[path];
      }
    }

    // 深度遍历添加路径
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (isObject(value[i]) && hasOwn(value[i], '__ob__')) {
          value[i].__ob__.op.traverseAddPath(i, value[i], newPathMap);
        }
      }
    } else {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (isObject(value[key]) && hasOwn(value[key], '__ob__')) {
          value[key].__ob__.op.traverseAddPath(key, value[key], newPathMap);
        }
      }
    }
  }

  delInvalidPaths (key, value, parentPathMap) {
    // 清除不存在的路径
    const pathMap = ObserverPath.getPathMap(key, parentPathMap)
    const keys = Object.keys(pathMap);
    let invalidPathMap = {};
    for (let i = 0; i < keys.length; i++) {
      invalidPathMap[keys[i]] = this.pathMap[keys[i]];
      delete this.pathMap[keys[i]];
    }

    // 深度遍历删除失效路径
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        if (isObject(value[i]) && hasOwn(value[i], '__ob__')) {
          value[i].__ob__.op.delInvalidPaths(i, value[i], invalidPathMap);
        }
      }
    } else {
      const keys = Object.keys(value);
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (isObject(value[key]) && hasOwn(value[key], '__ob__')) {
          value[key].__ob__.op.delInvalidPaths(key, value[key], invalidPathMap);
        }
      }
    }
  }

  /**
   * 得到父路径集合和子节点组合后的路径集合
   */
  static getPathMap (key, parentPathMap) {
    if (parentPathMap) {
      const keys = Object.keys(parentPathMap)
      if (keys.length) {
        let pathMap = {};
        for (let i = 0; i < keys.length; i++) {
          if (parentPathMap[keys[i]].path) {
            const path = setPath(key, parentPathMap[keys[i]].path);
            pathMap[path] = {key, root: parentPathMap[keys[i]].root, path};
          } else {
            pathMap[key] = {key, root: key, path: key}
          }
        }
        return pathMap;
      } else {
        return {[key]: {key, root: key, path: key}};
      }
    } else {
      return {[key]: {key, root: key, path: key}};
    }
  }
}
