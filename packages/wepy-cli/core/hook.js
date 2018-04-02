class Hook {
  constructor () {
    this._hooks = {};
  }
  register (key, fn) {
    if (!this._hooks[key]) {
      this._hooks[key] = [];
    }
    this._hooks[key].push(fn);
  }

  hook (key, ...args) {
    let rst = [];
    let fns = this._hooks[key] || [];
    fns.forEach(fn => {
      (typeof fn === 'function') && (rst.push(fn.apply(this, args)));
    });
    return rst;
  }

  hookSequence (key, p) {
    let rst = p;
    (this._hooks[key] || []).forEatch(fn => {
      (typeof fn === 'function') && (rst = fn.apply(this, rst));
    });
    return rst;
  }

  hookReturnOrigin (key, ...args) {
    let rst = [];
    let fns = this._hooks[key] || [];
    fns.forEach(fn => {
      (typeof fn === 'function') && (fn.apply(this, args));
    });
    return args;
  }
};

exports = module.exports = Hook;
