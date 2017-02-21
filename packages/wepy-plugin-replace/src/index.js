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

        let settings = [];

        if (setting instanceof Array) {
            settings = settings.concat(setting);
        } else if (setting instanceof Object && setting['0']) {
            for (let key in setting) {
                let value = setting[key];
                if(value.filter) {
                    settings.push(value);
                }
            }
        }
        else if (setting instanceof Object && setting.filter) {
            settings.push(setting);
        }

        settings.forEach((setting) => {
          if (setting.filter.test(op.file)) {
              op.output && op.output({
                  action: '变更',
                  file: op.file
              });

              op.code = op.code.replace(setting.config.find, setting.config.replace);
          }
        })

        op.next();
    }
}