const Hook = require('../hook');

exports = module.exports = class Chain extends Hook {
  constructor(bead) {
    super();
    this.bead = bead;
    this.npm = {
      // This chain is belong to a npm package.
      belong: false,
      // This chain is npm package.
      self: false
    };

    this.wepy = {
      // This chain is belong to a wepy component.
      belong: false,
      // This chain is wepy component.
      self: false
    };

    this.weapp = {
      // This chain is belong to a native weapp component.
      belong: false,
      // This is is a native weapp component.
      self: false
    };

    // previous Chain
    this.previous = null;

    // root Chain
    this.root = null;

    // next Chain
    this.series = [];
  }

  // Update previous chain
  setPrevious(pChain) {
    this.previous = pChain;
    ['npm', 'wepy', 'weapp'].forEach(item => {
      this[item].belong = pChain[item].self || pChain[item].belong;
    });
    this.root = pChain.root;
  }

  setSeries(sChains) {
    this.series = sChains;
  }

  createChain(bead) {
    const newChain = new Chain(bead);
    newChain.setPrevious(this);
    return newChain;
  }
};
