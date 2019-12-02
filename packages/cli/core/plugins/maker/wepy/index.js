const compiler = require('./compiler');
const parser = require('./parser');

exports = module.exports = class WepyMaker {
  constructor(options) {
    this.options = options;
  }
  install(compilation) {
    if (!this._installed) {
      compiler.call(compilation);
      parser.call(compilation);
      this._installed = true;
    }
  }
};
