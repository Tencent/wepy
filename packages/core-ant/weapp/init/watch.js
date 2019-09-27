export function initWatch (vm, watch) {
  if (watch) {
    Object.keys(watch).forEach(key => {
      vm.$watch(key, watch[key]);
    });
  }
}
