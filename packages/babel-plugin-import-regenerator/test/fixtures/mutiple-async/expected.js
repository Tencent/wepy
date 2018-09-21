"use strict";

var _regeneratorRuntime = require("regenerator-runtime");

var _regeneratorRuntime2 = _interopRequireDefault(_regeneratorRuntime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

exports = module.exports = {
  foo: function foo() {
    return Promise.resolve(1);
  },
  bar: function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime2.default.mark(function _callee() {
      return _regeneratorRuntime2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.t0 = console;
              _context.next = 3;
              return foo();

            case 3:
              _context.t1 = _context.sent;

              _context.t0.log.call(_context.t0, _context.t1);

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function bar() {
      return _ref.apply(this, arguments);
    }

    return bar;
  }(),
  bar2: function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime2.default.mark(function _callee2() {
      return _regeneratorRuntime2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return foo();

            case 2:
              return _context2.abrupt("return", _context2.sent);

            case 3:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function bar2() {
      return _ref2.apply(this, arguments);
    }

    return bar2;
  }(),
  bar3: function () {
    var _ref3 = _asyncToGenerator(
    /*#__PURE__*/
    _regeneratorRuntime2.default.mark(function _callee3() {
      var result;
      return _regeneratorRuntime2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return bar2();

            case 2:
              result = _context3.sent;
              console.log(result);

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function bar3() {
      return _ref3.apply(this, arguments);
    }

    return bar3;
  }()
};
