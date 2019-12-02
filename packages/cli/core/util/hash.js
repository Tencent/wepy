const crypto = require('crypto');
const fs = require('fs');

exports = module.exports = {
  hash(s) {
    let md5 = crypto.createHash('md5');
    md5.update(s);
    return md5.digest('hex');
  },
  hashFile(path) {
    let s = fs.readFileSync(path);
    return this.hash(s);
  }
};
