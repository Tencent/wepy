'use strict';

/**
 * Intercept a function
 * @param  {Function} fn           the function need to intercept
 * @param  {Object}   interceptors interceptors configuration
 * @return {Function}              intercepted function
 */
var intercept = function(fn, interceptors) {
  return function() {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    var self = this;
    if (fn._promisify) {
      var callit = function(args) {
        var promise = fn.apply(this, args);
        var successInterceptors = interceptors.success;
        if (typeof successInterceptors === 'function') {
          promise = promise.then(function (rst) {
            return successInterceptors(rst);
          });
        }
        var failInterceptors = interceptors.fail;
        if (typeof failInterceptors === 'function') {
          promise = promise.catch(function (e) {
            throw failInterceptors(e);
          });
        }
        return promise;
      };

      var configInterceptors = interceptors.config;
      if (typeof configInterceptors === 'function') {
        args = configInterceptors.apply(self, args);
      }
      if (isPromise(args)) {
        return args.then(function (res) {
          return callit(res);
        });
      } else {
        return callit(args);
      }
    } else {
      if (Array.isArray(args)) {
        args = args[0];
      }
      var callit$1 = function(args) {
        ['fail', 'success', 'complete'].forEach(function (item) {
          var bak = args[item];
          if (typeof bak === 'function') {
            args[item] = function (res) {
              if (typeof interceptors[item] === 'function') {
                res = interceptors[item].call(self, res);
              }
              bak.call(self, res);
            };
          }
        });
        return fn.call(self, args);
      };

      var configInterceptors$1 = interceptors.config;
      if (typeof configInterceptors$1 === 'function') {
        args = configInterceptors$1.call(self, args);
      }
      if (isPromise(args)) {
        return args
          .then(function (res) {
            return callit$1(res);
          })
          .catch(function (e) {
            var failInterceptors = interceptors.fail;
            if (typeof failInterceptors === 'function') {
              failInterceptors.call(self, e);
            }
          });
      } else {
        return callit$1(args);
      }
    }
  };
};

function isPromise(obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}
/*
 * wx API intercept
 * useage:
 * wepy.use(useIntercept)
 * wepy.intercept(wepy.wx.request, {
 *   config(params) {
 *     params.t = +new Date();
 *     return params;
 *     // return Promise.resolve(params);
 *   },
 *   success(res) {
 *     return res;
 *   },
 *   fail(e) {
 *     return e;
 *   }
 * })
 */
var index = {
  version: "2.0.1",
  install: function install(wepy) {
    wepy.wx = wepy.wx || Object.assign({}, wx);
    wepy.intercept = intercept;
  }
};

module.exports = index;
