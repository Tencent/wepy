const Chain = require('./Chain');

exports = module.exports = class WepyChain extends Chain {
  constructor(bead) {
    super(bead);
    this.sfc = {};
    this._allowedMetrics.push('wepy');
    this.self('wepy');
  }
};
