const Bead = require('./Bead');
exports = module.exports = class ConfigBead extends Bead {
  constructor(id, filepath, content) {
    super(id, filepath, content);
    this.lang = 'json';
  }
};
