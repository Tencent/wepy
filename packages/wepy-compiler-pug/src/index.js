import pug from 'pug';

let compiler = function (content, config) {
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

compiler.sync = function (content, config) {
    let data = config.data;
    let p, html;
    delete config.data;
    let fn = pug.compile(content, config);
    html = fn(data);
    return html;
};

export default compiler;