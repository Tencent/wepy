exports = module.exports = class Hook {

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

  hookSeq (key, ...args) {
    let rst = args;
    let hasHook = false;
    (this._hooks[key] || []).forEach((fn, i) => {
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
    let rst = [];
    let hooks = this._hooks[key] || [];

    let lastHook = hooks[hooks.length - 1];

    if (typeof lastHook === 'function') {
      return lastHook.apply(this, args);
    } else {
      return Promise.resolve(args);
    }
  }

  hookAsyncSeq (key, ...args) {
    let rst = args;
    let hooks = this._hooks[key] || [];

    let count = 0;
    let allRst = [];
    let lastRst = rst;

    if (hooks.length === 0) {
      return Promise.resolve(args);
    }

    return new Promise((resolve, reject) => {
      const iterateFunc = (pfn, cfn) => {
        return pfn.then(v => {
          if (!Array.isArray(v)) {
            v = [v];
          }
          if (count++ !== 0) {
            allRst = allRst.concat(v);
          }
          lastRst = v;
          return cfn.apply(this, lastRst);
        }).catch(e => {
          reject(e);
        })
      }

      hooks = hooks.concat(() => Promise.resolve());
      hooks.reduce(iterateFunc, Promise.resolve(args)).then(() => {
        resolve(lastRst);
      });
    });
  }
  hookReturnOrigin (key, ...args) {
    let rst = [];
    let fns = this._hooks[key] || [];
    fns.forEach(fn => {
      (typeof fn === 'function') && (fn.apply(this, args));
    });
    return args;
  }
}
