const Bead = require('./Bead');

exports = module.exports = class WepyBead extends Bead {
  constructor(id, filepath, content) {
    super(id, filepath, content);
    this.sfc = {};
    // only allow app/page/component;
    this.type = 'component';
  }

  isApp() {
    return this.type === 'app';
  }

  isPage() {
    return this.type === 'page';
  }

  isComponent() {
    return this.type === 'component';
  }
};
