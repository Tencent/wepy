const Bead = require('./Bead');

exports = module.exports = class WxsBead extends Bead {
  constructor(id, filepath, content) {
    super(id, filepath, content);
    this.module = 'wxsModule';
  }

  setModule(m) {
    this.module = m;
  }

  output() {
    return this.parsed.code.source();
  }
};
