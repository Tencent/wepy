import path from 'path';

export default class {

    constructor(c = {}) {
        const def = {
            filter: new RegExp('\w$'),
            config: {
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

            op.code = op.code.replace(setting.config.find, setting.config.replace);
            op.next();
        }
    }
}