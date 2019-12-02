const fs = require('fs');

class Producer {
  constructor() {
    this.sequence = 0;
    this.beads = [];
  }

  make(BeadType, filepath, id, content) {
    if (!id) {
      id = filepath;
    }
    if (!content) {
      content = fs.readFileSync(filepath, 'utf-8');
    }
    let bead;
    if (this.beads[id]) {
      bead = this.beads[id];
      bead.reload(content);
    } else {
      bead = new BeadType(id, filepath, content);
      bead.no = this.sequence;
      this.sequence++;
      this.beads.push(bead);
    }
    return bead;
  }
}

exports = module.exports = Producer;
