import pug from 'pug';

let compiler = function (content, config) {
    let data = config.data;
    let p;
    delete config.data;
    try {
        let fn = pug.compile(content, config);
        let html = fn(data);
        html = (html || '').replace(/<div /ig, '<view ').replace(/<\/div>/ig, '</view>').replace(/<div>/ig, '<view>')
        p = Promise.resolve(html);
    } catch (e) {
        console.log('编辑 PUG 错误', e);
        p = Promise.reject(e);
    }
    return p;
};

compiler.sync = function (content, config) {
    let data = config.data;
    let p, html;
    delete config.data;
    try {
        let fn = pug.compile(content, config);
        html = fn(data);
        html = (html || '').replace(/<div /ig, '<view ').replace(/<\/div>/ig, '</view>').replace(/<div>/ig, '<view>')
    } catch (e) {
      console.log('编辑 PUG 错误', e);
    }
    return html;
};

export default compiler;