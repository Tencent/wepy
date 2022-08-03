import { patchMixins, patchAppLifecycle } from '../init/index';
import { patchArrayProto } from '../observer/array';

export function app(option, rel) {
  let appConfig = {};

  patchMixins(appConfig, option, option.mixins);
  patchAppLifecycle(appConfig, option, rel);

  // 根据配置开关来决定是否要进行 Array Proto 的劫持
  // 默认会劫持原生 Array 对象
  if (!rel.info.DISABLE_ARRAY_PATCH) {
    patchArrayProto();
  }

  return App(appConfig);
}
