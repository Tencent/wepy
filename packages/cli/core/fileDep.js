class FileDep {
  constructor() {
    this._depMap = {};
    this._depedMap = {};
  }

  cleanDeps(source) {
    const deps = this._depMap[source] || [];
    deps.forEach(dep => {
      const depeds = this._depedMap[dep] || [];
      if (depeds.length > 0) {
        this._depedMap[dep] = depeds.filter(deped => deped !== source);
        if (this._depedMap[dep].length === 0) {
          delete this._depedMap[dep];
        }
      }
    });
    delete this._depMap[source];
  }

  addDeps(source, deps = []) {
    if (!this._depMap[source]) {
      this._depMap[source] = [];
    }
    deps.forEach(dep => {
      if (!this._depMap[source].includes(dep)) {
        this._depMap[source].push(dep);
        if (!this._depedMap[dep]) {
          this._depedMap[dep] = [];
        }
        this._depedMap[dep].push(source);
      }
    });
  }

  getDeps(source) {
    return this._depMap[source] || [];
  }

  getSources(dep) {
    return this._depedMap[dep] || [];
  }

  isInvolved(file) {
    return (this._depMap.hasOwnProperty(file) || this._depedMap.hasOwnProperty(file));
  }
}

exports = module.exports = FileDep;
