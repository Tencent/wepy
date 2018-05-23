exports.isTrue = (v) => v === true

exports.isFalse = (v) => v === false

exports.isUndef = (v) => {
    return v === undefined || v === null;
}

exports.isDef = (v) => {
    return v !== undefined && v !== null;
}

/**
 * 拼接完整地址
 * @param {*} baseURL 
 * @param {*} relativeURL 
 */
exports.combineURL = (baseURL, relativeURL) => {
    return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
}