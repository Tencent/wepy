const Chain = require('./Chain');

exports = module.exports = class AppChain extends Chain {
  constructor(bead) {
    super(bead);
    this.sfc = {};
    this.bead.chainType('app');
    super.self('weapp');
  }
};
