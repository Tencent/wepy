var g = require('./global');

// IOS 10.0.1 may cause IOS crash.
g.Promise = require('promise-polyfill');
g.regeneratorRuntime = require('regenerator-runtime/runtime');

