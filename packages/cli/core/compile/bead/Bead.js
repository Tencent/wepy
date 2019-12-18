const path = require('path');
const hashUtil = require('../../util/hash');
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
    // Language
    this.lang = null;
    // Customize data
    this.data = null;
    // Parser type
    this._parser = 'weapp';
    // Chain type
    this._metrics = { chainType: {} };
    // Valid metrics
    this._allowedMetrics = [
      /**
       * Current beads would be used in app compile chain.
       */
      'app',
      /**
       * Current beads would be used in page compile chain.
       */
      'page',
      /**
       * Current beads would be used in component compile chain.
       */
      'component',
      /**
       * Current beads would be used in normal chain.
       */
      'assets'
    ];
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

  parser(v) {
    // Set ignore
    if (v === undefined) {
      return this._parser;
    }
    return this._parser = v;
  }

  chainType(key, v) {
    // Set belong key
    if (key) {
      if (this._allowedMetrics.indexOf(key) === -1) {
        throw new Error('Metric ' + key + ' is not allowed');
      }
      if (v === undefined) v = true;
      if (!this._metrics.chainType[key]) {
        this._metrics.chainType[key] = v;
      }
    } else {
      return this._metrics.chainType;
    }
  }

  output() {
    return this.parsed.code.source();
  }
};
