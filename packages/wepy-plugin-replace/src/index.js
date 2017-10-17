import path from 'path';

export default class {

    constructor(c = {}) {
        const def = {
            filter: /\w$/,
            config: {
            }
        };

        if (Array.isArray(c)) {
            this.setting = c.map(s => Object.assign({}, def, s));
            return;
        }

        this.setting = Object.assign({}, def, c);
    }
    apply (op) {

        let setting = this.setting;

        let settings = [];

        if (setting instanceof Array) {
            settings = settings.concat(setting);
        } else if (setting instanceof Object && !setting.filter) {
            for (let key in setting) {
                let value = setting[key];
                if (value.filter) {
                    settings.push(value);
                }
            }
        } else if (setting instanceof Object && setting.filter) {
            settings.push(setting);
        }

        settings.forEach((setting) => {
            if (op.code !== null && setting.filter.test(op.file)) {
                op.output && op.output({
                    action: '变更',
                    file: op.file
                });

                let config = setting.config;
                let configs = [];

                if (config instanceof Array) {
                    configs = configs.concat(config);
                } else if (config instanceof Object && !config.find) {
                    for (let key in config) {
                        let value = config[key];
                        if (value.find) {
                            configs.push(value);
                        }
                    }
                } else if (config instanceof Object && config.find) {
                    configs.push(config);
                }

                configs.forEach((config) => {
                    op.code = op.code.replace(config.find, config.replace);
                })
            }
        })

        op.next();
    }
}
