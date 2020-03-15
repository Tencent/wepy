function proxy (item) {
  var vm = this;
  var _vm = this;
  return (function () {
    _vm.myClickInFor(item);
  })();
}
