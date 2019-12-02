const WeappChain = require('./WeappChain');

exports = module.exports = class WepyChain extends WeappChain {
  constructor(bead) {
    super(bead);
    this.sfc = {};
  }
};
