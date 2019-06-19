function normalizeMap (map) {
  if (typeof map === 'string')
    map = [ map ];
  return Array.isArray(map)
    ?  map.map(k => ({ key: k, val: k }))
    : Object.keys(map).map(k => ({ key: k, val: map[k] }));
}

export const mapState = function (states) {
  const res = {};
  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState() {
      if (!this.$store) {
        console.warn(`[@wepy/redux] state "${key}" do not work, if store is not defined.`);
        return;
      }
      const state = this.$store.getState();
      return typeof val === 'function'
        ?  val.call(this, state)
        : state[val];
    };
    res[key].redux = true;
  });
  return res;
};

export const mapActions = function (actions) {
  const res = {};
  normalizeMap(actions).forEach(({ key, val }) => {
    res[key] = function mappedAction(...args) {
      if (!this.$store) {
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
