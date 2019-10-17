/**
 * String type check
 */
exports.isStr = v => typeof v === 'string';
/**
 * Number type check
 */
exports.isNum = v => typeof v === 'number';
/**
 * Array type check
 */
exports.isArr = Array.isArray;
/**
 * undefined type check
 */
exports.isUndef = v => v === undefined;

exports.isTrue = v => v === true;

exports.isFalse = v => v === false;
/**
 * Function type check
 */
exports.isFunc = v => typeof v === 'function';
/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
exports.isObj = exports.isObject = obj => {
  return obj !== null && typeof obj === 'object';
};

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
const _toString = Object.prototype.toString;
exports.isPlainObject = obj => {
  return _toString.call(obj) === '[object Object]';
};

/**
 * Check whether the object has the property.
 */
const hasOwnProperty = Object.prototype.hasOwnProperty;
exports.hasOwn = (obj, key) => {
  return hasOwnProperty.call(obj, key);
};

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/)
 */
exports.noop = (a, b, c) => {};

/**
 * Check if val is a valid array index.
 */
exports.isValidArrayIndex = val => {
  const n = parseFloat(String(val));
  return n >= 0 && Math.floor(n) === n && isFinite(val);
};
