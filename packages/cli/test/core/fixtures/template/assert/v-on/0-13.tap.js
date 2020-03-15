function proxy () {
  var vm = this;
  var $wxEvent = arguments[arguments.length - 1];
  var $event = $wxEvent.arguments ? $wxEvent.arguments[0] : $wxEvent;
  var _vm = this;
  return (function () {
    _vm.myclick(1, $wxEvent, $event, $wxEvent.arguments);
  })();
}
