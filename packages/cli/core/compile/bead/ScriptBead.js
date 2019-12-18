const Bead = require('./Bead');

exports = module.exports = class ScriptBead extends Bead {
  constructor(id, filepath, content) {
    super(id, filepath, content);
    this.parser('script');
  }

  output() {
    return this.parsed.code.source();
  }
};
