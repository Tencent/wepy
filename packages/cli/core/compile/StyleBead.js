const Bead = require('./Bead');

exports = module.exports = class StyleBead extends Bead {
  constructor(id, filepath, content) {
    super(id, filepath, content);
  }
};
