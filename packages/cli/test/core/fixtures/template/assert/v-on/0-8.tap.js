function proxy () {
  var vm = this;
  var $wxEvent = arguments[arguments.length - 1];
  var $event = $wxEvent.arguments ? $wxEvent.arguments[0] : $wxEvent;
  var $args = $wxEvent.arguments;
  var _vm = this;
  return (function () {
    _vm.handleCaptureCatchTap.apply(vm, $args || [$event]);
  })();
}
