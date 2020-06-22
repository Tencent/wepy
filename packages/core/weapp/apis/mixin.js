import $global from '../global';

export function mixin(options = {}) {
  $global.mixins = ($global.mixins || []).concat(options);
}
