'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var vuex = require('vuex');

function wepyInstall (wepy) {
  vuex.install(wepy);

  wepy.mixin({
    created: function () {
      var this$1 = this;

      var computed = this.$options.computed;
      var loop = function ( k ) {
        if (computed[k].vuex) {
          this$1.$watch(k, function () {
            this._computedWatchers[k].evaluate();
          }, { deep: true });
        }
      };

      for (var k in computed) loop( k );
    }
  });
}

var index = {
  Store: vuex.Store,
  install: wepyInstall,
  version: vuex.version,
  mapState: vuex.mapState,
  mapMutations: vuex.mapMutations,
  mapGetters: vuex.mapGetters,
  mapActions: vuex.mapActions,
  createNamespacedHelpers: vuex.createNamespacedHelpers
};

exports.Store = vuex.Store;
exports.wepyInstall = vuex.install;
exports.version = vuex.version;
exports.mapState = vuex.mapState;
exports.mapMutations = vuex.mapMutations;
exports.mapGetters = vuex.mapGetters;
exports.mapActions = vuex.mapActions;
exports.createNamespacedHelpers = vuex.createNamespacedHelpers;
exports.default = index;
