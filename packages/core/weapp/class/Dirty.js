import {getPathMap} from '../observer/observerPath'

export default class Dirty {
  constructor (type) {
    this.reset();

    // path||key
    this.type = type || 'path';
  }

  push (key, path, keyVal, pathValue) {
    this._keys[key] = keyVal;
    this._path[path] = pathValue;
    this._length++;
  }

  pop () {
    let data = Object.create(null);
    if (this.type === 'path') {
      data = this._path;
    } else if (this.type === 'key') {
      data = this._keys;
    }
    this.reset();
    return data;
  }

  get (type) {
    return type === 'path' ? this._path : this._keys;
  }

  /**
   * Set dirty from a ObserverPath
   */
  set (op, key, value) {
    let pathMap;
    let pathKeys;
    // eslint-disable-next-line eqeqeq
    if (key != null) {
      const {combinePathKeys, combinePathMap} = getPathMap(key, op.pathKeys, op.pathMap);
      pathKeys = combinePathKeys;
      pathMap = combinePathMap;
    } else {
      pathKeys = op.pathKeys
      pathMap = op.pathMap
    }
    /**
     * 出于性能考虑，使用 usingComponents 时， setData 内容不会被直接深复制，
     * 即 this.setData({ field: obj }) 后 this.data.field === obj 。
     * 因此不需要所有 path 都 setData 。
     */
    const {root, path} = pathMap[pathKeys[0]];
    this.push(root, path, root === path ? value : op.ob.root[root], value);
  }

  reset () {
    this._keys = {};
    this._path = {};
    this._length = 0;
    return this;
  }

  length () {
    return this._length;
  }

}
