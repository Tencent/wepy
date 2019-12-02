const Chain = require('./Chain');

exports = module.exports = class WeappChain extends Chain {
  constructor(bead) {
    super(bead);
    this.sfc = {};
  }
};
