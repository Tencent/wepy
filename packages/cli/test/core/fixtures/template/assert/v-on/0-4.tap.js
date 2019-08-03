function proxy () {

    var _vm=this;
      return (function () {
        _vm.myClickCaptureStopWithParams(1, {a: 1}, [1, 2])
      })();

  }
