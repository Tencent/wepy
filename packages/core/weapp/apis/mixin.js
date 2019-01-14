import $global from '../global';

export function mixin (options = {}) {
  $global.mixin = ($global.mixin || []).concat(options);
}
