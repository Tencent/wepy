// copy from https://github.com/maichong/labrador/blob/master/global.js

const g = {
    Array: Array,
    Date: Date,
    Error: Error,
    Function: Function,
    Math: Math,
    Object: Object,
    RegExp: RegExp,
    String: String,
    TypeError: TypeError,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval
}

// 将关键字拆分，避免递归require自身
g['w' + 'indow'] = g['g' + 'lobal'] = g['s' + 'elf'] = g;

module.exports = g;
