import { getStore } from '../store';
import { mapState, mapActions } from '../helpers';

export default function connect (states, actions) {
    states = mapState(states || {});
    actions = mapActions(actions || {});
    return function connectComponent(Component) {
        let unSubscribe = null;
        // 绑定
        const onLoad = Component.prototype.onLoad;
        const onUnload = Component.prototype.onUnload;

        const onStateChange = function () {
            const store = getStore();
            let hasChanged = false;
            Object.keys(states).forEach((k) => {
                const newV = states[k]();
                if (this[k] !== newV) {
                    // 不相等
                    this[k] = newV;
                    hasChanged = true;
                }
            });
            hasChanged && this.$apply();
        };
        return class extends Component {
            constructor () {
                super();
                this.computed = Object.assign(this.computed || {}, states);
                this.methods = Object.assign(this.methods || {}, actions);
            }
            onLoad() {
                const store = getStore();
                unSubscribe = store.subscribe(onStateChange.bind(this));
                onStateChange.call(this);
                onLoad && onLoad.apply(this, arguments);
            }
            onUnload () {
                unSubscribe && unSubscribe();
                unSubscribe = null;
                onUnload && onUnload.apply(this, arguments);
            }
        };
    };
};
