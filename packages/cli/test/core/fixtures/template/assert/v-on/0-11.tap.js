function proxy () {
  var $wx = arguments[arguments.length - 1].$wx;
  var $event = ($wx.detail && $wx.detail.arguments) ? $wx.detail.arguments[0] : arguments[arguments.length - 1];
  var _vm = this;
  return (function () {
    _vm.myclick(1, $event);
  })();
}
