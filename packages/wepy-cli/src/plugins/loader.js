

export default class {

    plugins = [];
    index = 0;
    
    constructor(plugins, op) {
        let plg, plgkey, setting, config;
        for (plgkey in plugins) {
            setting = plugins[plgkey];
            try {
                plg = require('./' + plgkey).default;
            } catch (e) {
                throw '未定义插件：' + plgkey;
            }
            this.plugins.push(new plg(setting));
        }
        this.apply(0, op);
    }

    apply(index, op) {
        let plg = this.plugins[index];

        if (!plg) {
            op.done && op.done(op);
        } else {
            op.next = () => {
                this.apply(index + 1, op);
            };
            op.catch = () => {
                op.error && op.error(op);
            };
            if (plg)
                plg.apply(op);
        }

    }
}