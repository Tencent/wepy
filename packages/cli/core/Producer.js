const fs = require('fs');

class Producer {
  constructor() {
    this.sequence = 0;
    this.beads = [];
    this.beadsMap = {};
    this._vendors = [];
    this.asserts = [];
  }

  make(BeadType, filepath, id, content) {
    if (!id) {
      id = filepath;
    }
    if (!content) {
      content = fs.readFileSync(filepath, 'utf-8');
    }
    let bead;
    if (this.beadsMap[id]) {
      bead = this.beadsMap[id];
      bead.reload(content);
    } else {
      bead = new BeadType(id, filepath, content);
      bead.no = this.sequence;
      this.sequence++;
      this.beads.push(bead);
      this.beadsMap[id] = bead;
    }
    return bead;
  }

  vendors(chain) {
    if (chain !== undefined) {
      if (!this._vendors.includes(chain)) {
        this._vendors.push(chain);
      }
    } else {
      return this._vendors;
    }
  }
}

exports = module.exports = Producer;
