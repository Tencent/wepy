import path from 'path';
import uglify from 'uglify-js';

export default class {

    constructor(c = {}) {
        const def = {
            filter: new RegExp('\.(js)$'),
            config: {
                compress: {warnings: false}
            }
        };

        this.setting = Object.assign({}, def, c);
    }
    apply (op) {

        let setting = this.setting;

        if (!setting.filter.test(op.file)) {
            op.next();
        } else {
            //util.output('压缩', op.file);
            op.output && op.output({
                action: '压缩',
                file: op.file
            });
            this.setting.config.fromString = true;
            let rst = uglify.minify(op.code, this.setting.config);
            let k;
            for (k in rst)
                op[k] = rst[k];
            op.next();
        }
    }
}