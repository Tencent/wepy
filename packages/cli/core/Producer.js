const fs = require('fs');

class Producer {
  constructor() {
    this.sequence = 0;
    this.beads = [];
    this.beadsMap = {};
    this._vendors = [];
    this._asserts = [];
  }

  make(BeadType, filepath, id, content) {
    if (!id) {
      id = filepath;
    }
    if (!content) {
      try {
        content = fs.readFileSync(filepath, 'utf-8');
      } catch (err) {
        content = '';
      }
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

  asserts(chain) {
    if (chain !== undefined) {
      if (!this._asserts.includes(chain)) {
        this._asserts.push(chain);
      }
    } else {
      return this._asserts;
    }
  }
}

exports = module.exports = Producer;
