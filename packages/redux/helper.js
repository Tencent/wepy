function normalizeMap(map) {
  if (typeof map === 'string') map = [map];
  return Array.isArray(map) ? map.map(k => ({ key: k, val: k })) : Object.keys(map).map(k => ({ key: k, val: map[k] }));
}

export const mapState = function(states) {
  const res = Object.create(null);
  const resValueMap = Object.create(null);
  normalizeMap(states).forEach(({ key, val }) => {
    /**
     * resValueMap 记录由 mapState 产生的值
     * 在初始化时将其变成 observer 的
     */
    resValueMap[key] = Object.preventExtensions({ value: undefined });
    res[key] = function mappedState() {
      const state = this.$store.getState();
      const value = typeof val === 'function' ? val.call(this, state) : state[val];

      // 利用 redux state 每次改变都会返回一个新 state 的特性，只需做引用比较
      const resValueMap = res[key][this.$id];
      if (resValueMap[key].value !== value) {
        resValueMap[key] = Object.preventExtensions({ value });
      }
      return resValueMap[key].value;
    };
    res[key].redux = true;
    res[key].resValueMap = resValueMap;
  });
  return res;
};

export const mapActions = function(actions) {
  const res = {};
  normalizeMap(actions).forEach(({ key, val }) => {
    res[key] = function mappedAction(...args) {
      if (!this.$store) {
        // eslint-disable-next-line
        console.warn(`[@wepy/redux] action "${key}" do not work, if store is not defined.`);
        return;
      }
      let dispatchParam;
      if (typeof val === 'string') {
        dispatchParam = {
          type: val,
          payload: args.length > 1 ? args : args[0]
        };
      } else {
        dispatchParam = typeof val === 'function' ? val.apply(this.$store, args) : val;
      }
      return this.$store.dispatch(dispatchParam);
    };
  });
  return res;
};
