const path = require('path');
const fs = require('fs');

const DEFAULT_OPTIONS = {
  'entry': { type: String, default: 'app' },
  'src': { type: String, default: 'src' },
  'target': { type: String, default: 'weapp' },
  'static': { type: [String, Array], default: 'static' },
  'output': { type: String, default: 'weapp' },
  'platform': { type: String },
  'wpyExt': { type: String, default: '.wpy' },
  'eslint': { type: Boolean, default: true },
  'cliLogs': { type: Boolean, default: false },
  'build.web': { type: Object },
  'build.web.htmlTemplate': { type: String },
  'build.web.htmlOutput': { type: String },
  'build.web.jsOutput': { type: String },
  'build.web.resolve': { type: Object, link: 'resolve' },
  'resolve': { type: Object, default: {} },
  'compilers': { type: Object },
  'plugins': { type: Array, default: []},
  'appConfig': { type: Object },
  'appConfig.noPromiseAPI': { type: Array, default: []}
};


const DEFAULT_CONFIG = path.resolve('wepy.config.js');

function setValue (obj, key, val) {
  let arr = key.split('.');
  let left = obj;
  for (let i = 0, l = arr.length; i < l; i++) {
    if (i == l - 1) {
      left[arr[i]] = val;
    } else {
      if (typeof left[arr[i]] !== 'object') {
        left[arr[i]] = {};
      }
      left = left[arr[i]];
    }
  }
  return obj;
}

function getValue (obj, key) {
  let arr = key.split('.');
  let left = obj;
  let rst;
  for (let i = 0, l = arr.length; i < l; i++) {
    if (i == l - 1) {
      rst = left[arr[i]];
    } else {
      if (typeof left[arr[i]] === 'undefined') {
        break;
      }
      left = left[arr[i]];
    }
  }
  return rst;
}

function check (t, val) {
  if (Array.isArray(t)) {
    return t.some((type) => check(type, val));
  }
  switch (t) {
    case String:
      return typeof(val) === 'string';
    case Number:
      return typeof(val) === 'number';
    case Boolean:
      return typeof(val) === 'boolean';
    case Function:
      return typeof(val) === 'function';
    case Object:
      return typeof(val) === 'object';
    case Array:
      return toString.call(val) === '[object Array]';
    default:
      return val instanceof t;
  }
}

function parse (opt = {}, baseOpt = DEFAULT_OPTIONS, fromCommandLine) {

  let ret = {};

  for (let k in baseOpt) {
    let defaultItem = baseOpt[k];
    let val = getValue(opt, k);

    if (val === undefined) {
      if (defaultItem.default !== undefined && !fromCommandLine) {
        setValue(ret, k, defaultItem.default);
      }
    } else {
      if (!check(defaultItem.type, val)) {
        throw `Unexpected type: ${k} expect a ${defaultItem.type.name}`;
      }
      setValue(ret, k, val);
    }
  }
  return ret;
}

function convert (args) {
  if (!fs.existsSync(DEFAULT_CONFIG)) {
    throw `No configuration file found in the current directory.`
  }

  let opt = require(DEFAULT_CONFIG);
  let argOpt = parse(args, DEFAULT_OPTIONS, true);

  argOpt.watch = !!args.watch;
  argOpt.noCache = !!args.noCache;

  return Object.assign({}, parse(opt), argOpt);
}

exports = module.exports = {
  setValue: setValue,
  getValue: getValue,
  parse: parse,
  convert: convert
}
