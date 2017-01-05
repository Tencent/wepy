import * as ts from 'typescript';

export default function (content, config) {
    let p;
    try {
        let code = ts.transpileModule(content, config);
        p = Promise.resolve(code.outputText);
    } catch (e) {
        p = Promise.reject(e);
    }
    return p;
};