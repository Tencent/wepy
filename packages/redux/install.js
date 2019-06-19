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
    },
    created () {
      const store = this.$store;
      if (store) {
        const computed = this.$options.computed;
        store.subscribe(() => {
          for (let k in computed) {
            if (computed[k].redux) {
              // Set the key to dirty
              this._computedWatchers[k].evaluate();
              // Force render
              this.$forceUpdate();
            }
          }
        });
      }
    }
  })
};
