class FileDep {
  constructor() {
    this._depMap = {};
    this._depedMap = {};
  }

  update(source, deps = []) {
    this.cleanupDeps(source, deps);
    this._depMap[source] = deps;
    deps.forEach(dep => {
      if (this._depedMap[dep] == null) {
        this._depedMap[dep] = [];
      }
      if (!this._depedMap[dep].includes(source)) {
        this._depedMap[dep].push(source);
      }
    });
  }

  cleanupDeps(source, newDeps = []) {
    const oldDeps = this._depMap[source] || [];
    oldDeps.forEach(oldDep => {
      if (!newDeps.includes(oldDep)) {
        const depeds = this._depedMap[oldDep] || [];
        this._depedMap[oldDep] = depeds.filter(deped => deped !== source);
      }
    });
  }

  getDeps(source) {
    return this._depMap[source] || [];
  }

  getSources(dep) {
    return this._depedMap[dep] || [];
  }
}

exports = module.exports = FileDep;
