import pug from 'pug';

export default function (content, config) {
    let data = config.data;
    let p;
    delete config.data;
    try {
        let fn = pug.compile(content, config);
        let html = fn(data);
        p = Promise.resolve(html);
    } catch (e) {
        p = Promise.reject(e);
    }
    return p;
};