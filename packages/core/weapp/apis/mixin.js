import $global from '../global';
import { isPlainObject } from '../util/index';

export function mixin (options = {}) {
  if (isPlainObject(options)) {
    $global.mixin = options;
  } else {
    console.error(
      'Mixin global api supports plain object only\n\n' +
      'e.g: \n\n' +
      'wepy.mixin({\n' +
      '  created () {\n' +
      '    console.log(\'global mixin created\')\n' +
      '  }\n' +
      '})'
    )
  }
}
