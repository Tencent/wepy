/**
 * @desc ObserverPath 类以及相关处理函数
 * Observer 所在位置对应在整棵 data tree 的路径集合
 * @createDate 2019-07-21
 */
import { hasOwn, isNum, isObject, remove } from '../util/index'

/**
 * 生成完整路径
 * @param key  {String|Number} 当为字符串时，说明是属性名，当为数字时，说明是索引
 * @param parentPath {String} 父路径
 * @return {string}
 */
const setPath = (key, parentPath) => {
  return isNum(key)
    ? `${parentPath}[${key}]`
    : `${parentPath}.${key}`;
}

/**
 * 得到 ObserverPath
 * @param value 被观察对象
 * @return {ObserverPath|null}
 */
export const pickOp = value => {
  return isObject(value) && hasOwn(value, '__ob__')
    ? value.__ob__.op
    : null;
}

export default class ObserverPath {
  constructor (key, ob, parentOp) {
    this.ob = ob;
    // eslint-disable-next-line eqeqeq
    if (parentOp) {
      const {combinePathKeys, combinePathMap} = getPathMap(key, parentOp.pathKeys, parentOp.pathMap)
      this.pathKeys = combinePathKeys
      this.pathMap = combinePathMap;
    } else {
      this.pathKeys = null
      this.pathMap = null
    }
  }

  traverseOp (key, pathKeys, pathMap, handler) {
    // 得到 newKey 和 pathMap 组合的路径集合
    const {combinePathMap, combinePathKeys} = getPathMap(key, pathKeys, pathMap);
    let handlePathKeys = [];
    let handlePathMap = {};
    let hasChange = false;

    // 遍历 combinePathMap
    for (let i = 0; i < combinePathKeys.length; i++) {
      const pathObj = handler(combinePathMap[combinePathKeys[i]], this);
      if (pathObj) {
        hasChange = true;
        handlePathKeys.push(pathObj.path);
        handlePathMap[pathObj.path] = pathObj;
      }
    }

    if (hasChange) {
      const value = this.ob.value;
      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          const op = pickOp(value[i])
          op && op.traverseOp(i, handlePathKeys, handlePathMap, handler)
        }
      } else {
        const keys = Object.keys(value);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const op = pickOp(value[key])
          op && op.traverseOp(key, handlePathKeys, handlePathMap, handler)
        }
      }
    }

  }

  addPath (pathObj) {
    this.pathKeys.push(pathObj.path)
    this.pathMap[pathObj.path] = pathObj
  }

  delPath (path) {
    remove(this.pathKeys, path)
    delete this.pathMap[path]
  }
}

/**
 * 添加新的 __ob__ 的 path
 */
export function addPaths (newKey, op, parentOp) {
  op.traverseOp(newKey, parentOp.pathKeys, parentOp.pathMap, handler);

  function handler (pathObj, op) {
    if (!(pathObj.path in op.pathMap)) {
      // 新增一条 path
      op.addPath(pathObj);
      return pathObj;
    } else {
      return null;
    }
  }
}

/**
 * 删除指定的 __ob__ 的 path
 */
export function cleanPaths (oldKey, op, parentOp) {
  op.traverseOp(oldKey, parentOp.pathKeys, parentOp.pathMap, handler);

  function handler (pathObj, op) {
    // 删除一条 path
    op.delPath(pathObj.path);
    return pathObj;
  }
}

/**
 * 得到 pathMap 与 key 组合后的路径集合
 */
export function getPathMap (key, pathKeys, pathMap) {
  if (pathMap) {
    // console.log('pathMap', pathMap)
    let combinePathKeys = [];
    let combinePathMap = {};
    for (let i = 0; i < pathKeys.length; i++) {
      const path = setPath(key, pathMap[pathKeys[i]].path);
      combinePathKeys.push(path)
      combinePathMap[path] = {key, root: pathMap[pathKeys[i]].root, path};
    }
    return {combinePathKeys, combinePathMap};
  } else {
    return {
      combinePathKeys: [key],
      combinePathMap: {[key]: {key, root: key, path: key}}
    };
  }
}
