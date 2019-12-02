const Bead = require('./Bead');
exports = module.exports = class ConfigBead extends Bead {
  constructor(id, filepath, content) {
    super(id, filepath, content);
    this.lang = 'json';
  }

  output() {
    return JSON.stringify(this.parsed.source, null, 2);
  }
};
