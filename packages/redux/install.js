export default function wepyInstall (wepy) {
  wepy.mixin({
    beforeCreate () {
      const options = this.$options;
      if (options.store) {
        this.$store = typeof options.store === 'function'
          ? options.store()
          : options.store;
      } else if (options.parent && options.parent.$store) {
        this.$store = options.parent.$store;
      }
      if (checkReduxComputed(this.$options)) {
        if (!this.$store) {
          console.warn(`[@wepy/redux] state do not work, if store is not defined.`);
          return;
        }
        const { computed } = this.$options;
        const keys = Object.keys(computed);
        for (let i = 0; i < keys.length; i++) {
          if ('resValueMap' in computed[keys[i]]) {
            wepy.observe({
              vm: this,
              key: '',
              value: computed[keys[i]].resValueMap,
              parent: '',
              root: true
            });
            break;
          }
        }
      }
    },

    created () {
      if (!checkReduxComputed(this.$options)) {
        return;
      }
      const store = this.$store;
      const { computed } = this.$options;
      this.$unsubscribe = store.subscribe(() => {
        const keys = Object.keys(computed);
        for (let i = 0; i < keys.length; i++) {
          if ('redux' in computed[keys[i]]) {
            this._computedWatchers[keys[i]].get();
          }
        }
      });
    },

    detached () {
      this.$unsubscribe && this.$unsubscribe();
    }
  })
};

function checkReduxComputed(options) {
  if (!('computed' in options)) {
    return false;
  }
  const { computed } = options;
  const keys = Object.keys(computed);
  for (let i = 0; i < keys.length; i++) {
    if ('redux' in computed[keys[i]]) {
      return true;
    }
  }
  return false;
}
