import path from 'path';
import {pd} from 'pretty-data';


export default class {

    constructor(c = {}) {
        const def = {
            filter: new RegExp('\.(wxml|xml|json)$'),
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
                action: '压缩',
                file: op.file
            });

            if (/\.(wxml|xml)$/.test(op.file)) {
                op.code = pd.xmlmin(op.code);
            } else if (/\.json$/.test(op.file)) {
                op.code = pd.jsonmin(op.code);
            }
            op.next();
        }
    }
}