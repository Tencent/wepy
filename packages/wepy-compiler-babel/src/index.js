import {transform} from 'babel-core';

export default function (content, config) {
    let p;
    try {
        let code = transform(content, config).code;
        p = Promise.resolve(code);
    } catch (e) {
        p = Promise.reject(e);
    }
    return p;
};