var global = module.exports = typeof window !== 'undefined' && window.Math === Math
  ? window : typeof self !== 'undefined' && self.Math === Math ? self : this;
