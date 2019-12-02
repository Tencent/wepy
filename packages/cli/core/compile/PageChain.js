const WeappChain = require('./WeappChain');

exports = module.exports = class PageChain extends WeappChain {
  constructor(bead) {
    super(bead);
    this.sfc = {};
  }
};
