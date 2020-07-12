'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function normalizeMap(map) {
  if (typeof map === 'string') { map = [map]; }
  return Array.isArray(map) ? map.map(function (k) { return ({ key: k, val: k }); }) : Object.keys(map).map(function (k) { return ({ key: k, val: map[k] }); });
}

var mapState = function(states) {
  var res = Object.create(null);
  var resValueMap = Object.create(null);
  normalizeMap(states).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    /**
     * resValueMap 记录由 mapState 产生的值
     * 在初始化时将其变成 observer 的
     */
    resValueMap[key] = Object.preventExtensions({ value: undefined });
    res[key] = function mappedState() {
      var state = this.$store.getState();
      var value = typeof val === 'function' ? val.call(this, state) : state[val];

      // 利用 redux state 每次改变都会返回一个新 state 的特性，只需做引用比较
      var resValueMap = res[key][this.$id];
      if (resValueMap[key].value !== value) {
        resValueMap[key] = Object.preventExtensions({ value: value });
      }
      return resValueMap[key].value;
    };
    res[key].redux = true;
    res[key].resValueMap = resValueMap;
  });
  return res;
};

var mapActions = function(actions) {
  var res = {};
  normalizeMap(actions).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;

    res[key] = function mappedAction() {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      if (!this.$store) {
        // eslint-disable-next-line
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

function wepyInstall(wepy) {
  wepy.mixin({
    beforeCreate: function beforeCreate() {
      var options = this.$options;
      if (options.store) {
        this.$store = typeof options.store === 'function' ? options.store() : options.store;
      } else if (options.parent && options.parent.$store) {
        this.$store = options.parent.$store;
      }
      if (checkReduxComputed(this.$options)) {
        if (!this.$store) {
          // eslint-disable-next-line
          console.warn("[@wepy/redux] state do not work, if store is not defined.");
          return;
        }
        var ref = this.$options;
        var computed = ref.computed;
        var keys = Object.keys(computed);
        var resValueMap;
        for (var i = 0; i < keys.length; i++) {
          if ('resValueMap' in computed[keys[i]]) {
            if (!resValueMap) {
              resValueMap = Object.assign({}, computed[keys[i]].resValueMap);
            }
            computed[keys[i]][this.$id] = resValueMap;
          }
        }
        wepy.observe({
          vm: this,
          key: '',
          value: resValueMap,
          parent: '',
          root: true
        });
      }
    },

    created: function created() {
      var this$1 = this;

      if (!checkReduxComputed(this.$options)) {
        return;
      }
      var store = this.$store;
      var ref = this.$options;
      var computed = ref.computed;
      this.$unsubscribe = store.subscribe(function () {
        var keys = Object.keys(computed);
        for (var i = 0; i < keys.length; i++) {
          if ('redux' in computed[keys[i]]) {
            this$1._computedWatchers[keys[i]].get();
          }
        }
      });
    },

    detached: function detached() {
      this.$unsubscribe && this.$unsubscribe();
    }
  });
}

function checkReduxComputed(options) {
  if (!('computed' in options)) {
    return false;
  }
  var computed = options.computed;
  var keys = Object.keys(computed);
  for (var i = 0; i < keys.length; i++) {
    if ('redux' in computed[keys[i]]) {
      return true;
    }
  }
  return false;
}

var index = {
  install: wepyInstall,
  version: "2.1.0"
};

exports.default = index;
exports.mapState = mapState;
exports.mapActions = mapActions;
