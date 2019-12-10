const Bead = require('./Bead');

exports = module.exports = class TemplateBead extends Bead {
  constructor(id, filepath, content) {
    super(id, filepath, content);
  }

  output() {
    return this.parsed.code.source();
  }
};
