function proxy () {
    var $event = arguments[arguments.length - 1];
    var _vm=this;
      return (function () {
        _vm.myclickCaptureStop($event)
      })();

  }
