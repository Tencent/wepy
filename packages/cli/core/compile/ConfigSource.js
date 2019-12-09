const Source = require('./Source')

exports = module.exports = class ConfigSource extends Source {
  constructor (raw) {
    super(raw);
    try {
      let fn = new Function('return ' + raw);
      this._meta = fn();
    } catch (e) {
      throw new Error(`invalid json: ${raw}`);
    }
  }

  source () {
    return JSON.stringify(this._meta, null, 2);
  }

  meta (_meta) {
    if (_meta) {
      this._meta = _meta;
    }
    return this._meta;
  }
}