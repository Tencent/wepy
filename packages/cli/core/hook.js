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

  hasHook (key) {
    return (this._hooks[key] || []).length > 0;
  }

  hook (key, ...args) {
    let rst = [];
    let fns = this._hooks[key] || [];
    fns.forEach(fn => {
      (typeof fn === 'function') && (rst.push(fn.apply(this, args)));
    });
    return rst;
  }

  hookSeq (key, ...args) {
    let rst = args;
    let fns = this._hooks[key] || [];
    let hasHook = false;

    fns.forEach((fn, i) => {
      if (typeof fn === 'function') {
        hasHook = true;
        if (fn.length > 1) {
          rst = fn.apply(this, rst);
        } else {
          rst = fn.call(this, i === 0 ? rst[0] : rst);
        }
      }
    });

    return hasHook ? rst : (rst.length <= 1 ? rst[0] : rst);
  }

  hookUnique (key, ...args) {
    let fns = this._hooks[key] || [];
    let lastFn = fns[fns.length - 1];

    if (typeof lastFn === 'function') {
      return lastFn.apply(this, args);
    }
  }

  hookUniqueReturnArg (key, ...args) {
    let rst = this.hookUnique(key, ...args);
    if (typeof rst === 'undefined') {
      rst = (args.length <= 1 ? args[0] : args);
    }
    return rst;
  }

  hookAsyncSeq (key, ...args) {
    let rst = args;
    let fns = this._hooks[key] || [];
    let lastRst = rst;
    let argLength = args.length;

    if (fns.length === 0) {
      return Promise.resolve(argLength === 1 ? args[0] : args);
    }

    return new Promise((resolve, reject) => {
      const iterateFunc = (pfn, cfn) => {
        return pfn.then(v => {
          if (!Array.isArray(v)) {
            v = [v];
          }
          lastRst = v;
          return cfn.apply(this, lastRst);
        }).catch(e => {
          reject(e);
        })
      };

      fns = fns.concat(
        (...lastRst) => Promise.resolve(argLength === 1 ? lastRst[0] : lastRst)
      );
      return fns.reduce(iterateFunc, Promise.resolve(args));
    });
  }

  hookReturnOrigin (key, ...args) {
    let fns = this._hooks[key] || [];
    fns.forEach(fn => {
      (typeof fn === 'function') && (fn.apply(this, args));
    });
    return (args.length <= 1 ? args[0] : args);
  }

  unregister(key) {
    return delete this._hooks[key];
  }
}

exports = module.exports = Hook;
