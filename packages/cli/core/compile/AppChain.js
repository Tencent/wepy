const Chain = require('./Chain');

exports = module.exports = class AppChain extends Chain {
  constructor(bead) {
    super(bead);
    this.root = this;
    this.previous = null;
  }
};
