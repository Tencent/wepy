// clone from https://github.com/vuejs/vuex/blob/dev/src/helpers.js
// modified by wepy
import { getStore } from '../store';

export const mapState = function (states) {
    const res = {};
    normalizeMap(states).forEach(({ key, val }) => {
        res[key] = function mappedState () {
            const store = getStore();
            const state = store.getState();
            return typeof val === 'function'
                ? val.call(this, state)
                : state[val];
        };
    });
    return res;
}

export const mapActions = function (actions) {
    const res = {};
    normalizeMap(actions).forEach(({ key, val }) => {
        res[key] = function mappedAction (...args) {
            const store = getStore();
            let dispatchParam
            if (typeof val === 'string') {
                // 如果是字符串代表是直接同步模式 一个 action 的名字而已
                dispatchParam = {
                    type: val,
                    // 修正一般情况下的参数 一般支持只传一个参数
                    // 如果真的是多个参数的话 那么 payload 就是参数组成的数组
                    payload: args.length > 1 ? args : args[0]
                }
            } else {
                // 如果说是函数 则先调用执行
                // 否则直接 dispatch 该值 例如说是个 promise
                dispatchParam = typeof val === 'function' ? val.apply(this, args) : val
            }
            return store.dispatch.call(store, dispatchParam);
        }
    });
    return res;
}

function normalizeMap (map) {
    return Array.isArray(map)
        ? map.map(key => ({ key, val: key }))
        : Object.keys(map).map(key => ({ key, val: map[key] }))
}
