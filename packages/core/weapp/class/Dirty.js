export default class Dirty {
  constructor (type) {
    this.reset();

    // path||key
    this.type = type || 'path';
  }

  push (key, path, value) {
    this._keys[key] = value;
    this._path[path] = value;
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
