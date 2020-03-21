function proxy () {
  var $wx = arguments[arguments.length - 1].$wx;
  var _vm = this;
  return (function () {
    _vm.myclick(1, $wx);
  })();
}
