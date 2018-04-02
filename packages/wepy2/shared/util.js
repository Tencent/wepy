/**
 * String type check
 */
export const isStr = (v) => typeof v === 'string';
/**
 * Array type check
 */
export const isArr = Array.isArray;
/**
 * undefined type check
 */
export const isUndef = (v) => v === undefined;
/**
 * Function type check
 */
export const isFunc = (v) => typeof v === 'function';
/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

export const isObj = isObject;
/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
const _toString = Object.prototype.toString;
export function isPlainObject (obj) {
  return _toString.call(obj) === '[object Object]';
}

/**
 * Check whether the object has the property.
 */
const hasOwnProperty = Object.prototype.hasOwnProperty
export function hasOwn (obj, key) {
  return hasOwnProperty.call(obj, key)
}

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
 */
export function noop (a, b, c) {}

/**
 * Check if val is a valid array index.
 */
export function isValidArrayIndex (val) {
  const n = parseFloat(String(val))
  return n >= 0 && Math.floor(n) === n && isFinite(val)
}
