import path from 'path';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';

export default class {

    constructor(c = {}) {
        const def = {
            filter: new RegExp('\.(wxss)$'),
            config: {
                browsers: ['Android >= 2.3', 'Chrome > 20', 'iOS >= 6']
            }
        };

        this.setting = Object.assign({}, def, c);
    }
    apply (op) {

        let setting = this.setting;

        if (!setting.filter.test(op.file)) {
            op.next();
        } else {
            op.output && op.output({
                action: '变更',
                file: op.file
            });

            let prefixer = postcss([ autoprefixer(this.setting.config) ]);

            prefixer.process(op.code).then((result) => {
                op.code = result.css;
                op.next();
            }).catch(e => {
                op.err = e;
                op.catch();
            });
        }
    }
}