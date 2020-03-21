function proxy () {
  var $wx = arguments[arguments.length - 1].$wx;
  var $args = $wx.detail && $wx.detail.arguments;
  var _vm = this;
  return (function () {
    _vm.myclick(1, $args);
  })();
}
