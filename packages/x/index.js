import { Store, install, mapState, mapMutations, mapGetters, mapActions, createNamespacedHelpers } from 'vuex';

const version = __VERSION__;

function wepyInstall(wepy) {
  install(wepy);

  wepy.mixin({
    created: function() {
      let computed = this.$options.computed;
      for (let k in computed) {
        if (computed[k].vuex) {
          this.$watch(
            k,
            function() {
              this._computedWatchers[k].evaluate();
            },
            { deep: true }
          );
        }
      }
    },
    // When page unload, page instance will lose.
    // But the store data dependences they are still present
    onUnload: function () {
      // List all keys in computed watchers
      for (let key in this._computedWatchers) {
        const item = this._computedWatchers[key];
        // Clean deps
        item.deps = item.deps.filter(dep => {
          // If sub.vm === current page, then remove it
          dep.subs = dep.subs.filter(sub => sub.vm !== this);
          if (dep.subs.length === 0) {
            // Remove dep ids
            item.depIds.delete(dep.id);
            return false;
          }
          return true;
        })
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
