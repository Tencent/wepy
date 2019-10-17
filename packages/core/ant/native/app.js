import { patchMixins, patchAppLifecycle } from '../init/index';

export function app (option, rel) {
  let appConfig = {};

  patchMixins(appConfig, option, option.mixins);
  patchAppLifecycle(appConfig, option, rel);

  return App(appConfig);
}
