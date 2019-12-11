const Hook = require('../../hook');

exports = module.exports = class Chain extends Hook {
  constructor(bead) {
    super();
    this.bead = bead;
    this._metrics = { belong: {}, self: {} };
    this._allowedMetrics = [
      /**
       * npm resource.
       */
      'npm',
      /**
       * if current chain instanceof weapp chain(AppChain/PageChain/ComponentChain), the
       * current chain should be compiled to four type files(script/config/style/template).
       */
      'weapp',
      /**
       * it will be removed later.
       */
      'wepy'
    ];

    /*
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
    */

    // previous Chain
    this.previous = null;

    // root Chain
    this.root = null;

    // next Chain
    this.series = [];
  }

  belong(key, v) {
    // Set belong key
    if (key) {
      if (this._allowedMetrics.indexOf(key) === -1) {
        throw new Error('Metric ' + key + ' is not allowed');
      }
      if (v === undefined) v = true;
      if (!this._metrics.belong[key]) {
        this._metrics.belong[key] = v;
      }
    } else {
      return this._metrics.belong;
    }
  }

  self(key, v) {
    // Set belong key
    if (key) {
      if (this._allowedMetrics.indexOf(key) === -1) {
        throw new Error('Metric ' + key + ' is not allowed');
      }
      if (v === undefined) v = true;
      if (!this._metrics.self[key]) {
        this._metrics.self[key] = true;
      }
    } else {
      return this._metrics.self;
    }
  }

  // Update previous chain
  setPrevious(pChain) {
    this.previous = pChain;
    Object.keys(this.belong())
      .concat(Object.keys(this.self()))
      .forEach(item => {
        this.belong(item, pChain.belong()[item] || pChain.self()[item]);
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
