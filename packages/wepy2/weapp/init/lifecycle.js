import Watcher from './../observer/watcher';

export function initLifecycle (vm, pageConfig) {
  pageConfig.onLoad = function () {
    let wxpage = this;
    vm.$wxpage = wxpage;

    let init = false;

    let renderWatcher = new Watcher(vm, function () {
      if (!init) {
        for (let k in vm._data) {
          // initialize getter dep
          vm._data[k];
        }
        init = true;
      }

      if (vm.$dirty.length) {
        let dirtyData = {};
        vm.$dirty.concat(Object.keys(vm._computedWatchers || {})).forEach(k => {
          dirtyData[k] = vm[k];
        });
        vm.$dirty = [];
        wxpage.setData(dirtyData);
      }
    }, function () {

    }, null, true);

    let result;
    (typeof vm.$option.onLoad === 'function') && (result = vm.$option.onLoad.call(vm));
    return result;
  }
}
