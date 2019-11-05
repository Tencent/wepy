class CacheFile {
  constructor() {
    this._data = {};
  }

  set(k, v) {
    this._data[k] = v;
  }
  get(k) {
    return this._data[k];
  }
}

exports = module.exports = CacheFile;
