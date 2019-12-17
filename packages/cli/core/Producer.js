const fs = require('fs');

class Producer {
  constructor() {
    this.sequence = 0;
    this.beads = [];
    this.beadsMap = {};
    this._vendors = [];
    this._assets = [];
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

  assets(chain) {
    if (chain !== undefined) {
      if (!this._assets.includes(chain)) {
        this._assets.push(chain);
      }
    } else {
      return this._assets;
    }
  }
}

exports = module.exports = Producer;
