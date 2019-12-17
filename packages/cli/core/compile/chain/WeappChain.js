const Chain = require('./Chain');

/* Weapp Native Component */
exports = module.exports = class WeappChain extends Chain {
  constructor(bead) {
    super(bead);
    this.sfc = {};
    super.self('weapp');
  }
};
