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
    type === type || this.type;
    return type === 'path' ? this._path : this._keys;
  }

  /**
   * Set dirty from a ObserverPath
   */
  set (op, key, value) {
    const m = key ? op.getPathMap(key) : op.pathMap;
    const keys = Object.keys(m);
    for (let i = 0; i < keys.length; i++) {
      const {root, path} = m[keys[i]];
      if (op.observer.hasPath(path)) {
        this.push(root, path, op.observer.vm[root], value);
      } else {
        delete m[keys[i]];
      }
    }
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
