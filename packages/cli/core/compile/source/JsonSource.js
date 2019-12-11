const RawSource = require('webpack-sources').RawSource;

exports = module.exports = class JsonSource extends RawSource {
  constructor(value, convertToString = false) {
    super(value, convertToString);
    try {
      let fn = new Function('return ' + value);
      this._meta = fn();
    } catch (e) {
      throw new Error(`invalid json: ${value}`);
    }
  }

  source() {
    return JSON.stringify(this._meta, null, 2);
  }

  meta(_meta) {
    if (_meta) {
      this._meta = _meta;
    }
    return this._meta;
  }
};
