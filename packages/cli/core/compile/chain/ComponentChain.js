const Chain = require('./Chain');

exports = module.exports = class ComponentChain extends Chain {
  constructor(bead) {
    super(bead);
    this.sfc = {};
    this.bead.chainType('component');
    super.self('weapp');
  }
};
