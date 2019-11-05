const path = require('path');
const hashUtil = require('../util/hash');
exports = module.exports = class Bead {
  constructor(id, filepath, content) {
    // Compile physical file path; works for compile and output.
    this.path = filepath;
    // Reference physical file path, Like a.wpy <script src=b.js />. only works for error handler.
    this.refPath = filepath;
    // Fake unqiue id, use file path + postfix
    this.id = id;
    // File hash
    this.hash = hashUtil.hash(content);
    // File content
    this.content = content;
    this.source = null;
    // File extention
    this.ext = path.parse(filepath).ext;
    // Compiled result
    this.compiled = null;
    // Parsed result
    this.parsed = null;
  }

  load() {}

  reload(content) {
    const fileHash = hashUtil.hash(content);
    if (fileHash !== this.hash) {
      this.content = content;
      this.hash = fileHash;
      this.clean();
    }
  }
  clean() {
    this.parsed = null;
    this.compiled = null;
  }
};
