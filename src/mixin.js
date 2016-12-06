export default class {

    data = {};

    components = {};

    methods = {};

    events = {};

    init (parent) {
        let k;

        // 自定义方法与属性覆盖
        Object.getOwnPropertyNames(this).forEach((k) => {
            if (k[0] + k[1] !== 'on') {
                if (!parent[k])
                    parent[k] = this[k];
            }
        });

        // 数据，事件，组件覆盖
        ['data', 'events', 'components'].forEach((item) => {
            Object.getOwnPropertyNames(this[item]).forEach((k) => {
                if (k !== 'init' && !parent[item][k])
                    parent[item][k] = this[item][k];
            });
        });
    }


}