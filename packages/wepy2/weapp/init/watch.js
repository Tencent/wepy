export function initWatch (vm, watch) {
  Object.keys(watch).forEach(key => {
    vm.$watch(key, watch[key]);
  });
}
