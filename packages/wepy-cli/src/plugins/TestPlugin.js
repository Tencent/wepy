import path from 'path';
import util from './../util';


export default class {

    constructor(c = {}) {
        const def = {
            filter: new RegExp('\.(test)$'),
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
            util.output('测试', op.file);
            op.code = op.code + '/*test*/';
            op.next();
        }
    }
}