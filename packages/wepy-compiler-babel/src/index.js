import {transform} from 'babel-core';

export default function (content, config) {
    let p;
    try {
        let rst = transform(content, config);
        p = Promise.resolve(rst);
    } catch (e) {
        p = Promise.reject(e);
    }
    return p;
};