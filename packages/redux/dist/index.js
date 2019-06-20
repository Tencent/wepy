'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function normalizeMap (map) {
  if (typeof map === 'string')
    { map = [ map ]; }
  return Array.isArray(map)
    ?  map.map(function (k) { return ({ key: k, val: k }); })
    : Object.keys(map).map(function (k) { return ({ key: k, val: map[k] }); });
}

var mapState = function (states) {
  var res = {};
  normalizeMap(states).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedState() {
      if (!this.$store) {
        console.warn(("[@wepy/redux] state \"" + key + "\" do not work, if store is not defined."));
        return;
      }
      var state = this.$store.getState();
      return typeof val === 'function'
        ?  val.call(this, state)
        : state[val];
    };
    res[key].redux = true;
  });
  return res;
};

var mapActions = function (actions) {
  var res = {};
  normalizeMap(actions).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedAction() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      if (!this.$store) {
        console.warn(("[@wepy/redux] action \"" + key + "\" do not work, if store is not defined."));
        return;
      }
      var dispatchParam;
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

function wepyInstall (wepy) {
  wepy.mixin({
    beforeCreate: function beforeCreate () {
      var options = this.$options;
      if (options.store) {
        this.$store = typeof options.store === 'function'
          ? options.store()
          : options.store;
      } else if (options.parent && options.parent.$store) {
        this.$store = options.parent.$store;
      }
    },
    created: function created () {
      var this$1 = this;

      var store = this.$store;
      if (store) {
        var computed = this.$options.computed;
        store.subscribe(function () {
          for (var k in computed) {
            if (computed[k].redux) {
              // Set the key to dirty
              this$1._computedWatchers[k].evaluate();
              // Force render
              this$1.$forceUpdate();
            }
          }
        });
      }
    }
  });
}

var index = {
  install: wepyInstall,
  version: "2.0.1"
};

exports.default = index;
exports.mapState = mapState;
exports.mapActions = mapActions;
