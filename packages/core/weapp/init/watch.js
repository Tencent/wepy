export function initWatch (vm, watch) {
  vm._watchers = vm._watchers || [];
  if (watch) {
    Object.keys(watch).forEach(key => {
      vm.$watch(key, watch[key]);
    });
  }
}
