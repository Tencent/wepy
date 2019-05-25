import { Store, install, version, mapState, mapMutations, mapGetters, mapActions, createNamespacedHelpers } from 'vuex';

function wepyInstall (wepy) {
  install(wepy);

  wepy.mixin({
    created: function () {
      let computed = this.$options.computed;
      for (let k in computed) {
        if (computed[k].vuex) {
          this.$watch(k, function () {
            this._computedWatchers[k].evaluate();
          }, { deep: true });
        }
      }
    }
  });
}

export default {
  Store,
  install: wepyInstall,
  version,
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers
};

export {
  Store,
  wepyInstall as install,
  version,
  mapState,
  mapMutations,
  mapGetters,
  mapActions,
  createNamespacedHelpers
};
