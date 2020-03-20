function proxy () {
  var vm = this;
  var _vm = this;
  return (function () {
    _vm.myclick();
  })();
}
