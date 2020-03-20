function proxy () {
  var vm = this;
  var $wx = arguments[arguments.length - 1].$wx;
  var $event = ($wx.detail && $wx.detail.arguments) ? $wx.detail.arguments[0] : arguments[arguments.length - 1];
  var $args = $wx.detail && $wx.detail.arguments;
  if ($wx.detail && $wx.detail.arguments) {
    $wx.detail = $wx.detail.arguments.length > 1 ? $wx.detail.arguments : $wx.detail.arguments[0];
  }
  var _vm = this;
  return (function () {
    _vm.myclick.apply(vm, $args || [$event]);
  })();
}
