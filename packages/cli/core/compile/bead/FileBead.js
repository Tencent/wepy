const Bead = require('./Bead');
exports = module.exports = class FileBead extends Bead {
  constructor(id, filepath, content) {
    super(id, filepath, content);
    this.parser('file');
  }

  output() {
    return this.parsed.code.source();
  }
};
