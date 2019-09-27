// can we use __proto__?
export const hasProto = '__proto__' in {};

let _Set
/* istanbul ignore if */ // $flow-disable-line
if (typeof Set !== 'undefined' && isNative(Set)) {
  // use native Set when available.
  _Set = Set
} else {
  // a non-standard Set polyfill that only works with primitive keys.
  _Set = class Set {
    constructor () {
      this.set = Object.create(null)
    }
    has (key) {
      return this.set[key] === true
    }
    add (key) {
      this.set[key] = true
    }
    clear () {
      this.set = Object.create(null)
    }
  }
}

export { _Set }


/* istanbul ignore next */
export function isNative (Ctor) {
  return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
}
