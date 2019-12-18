const Chain = require('./Chain');

exports = module.exports = class PageChain extends Chain {
  constructor(bead) {
    super(bead);
    this.sfc = {};
    this.bead.chainType('page');
    super.self('weapp');
  }
};
