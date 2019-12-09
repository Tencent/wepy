exports = module.exports = class Source {
  constructor (raw) {
    this._source = raw ;
  }

  source () {
    return this._source
  }
}