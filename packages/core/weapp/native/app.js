import { patchAppLifecycle } from '../init/index';

export function app (option, rel) {
  let appConfig = {};

  patchAppLifecycle(appConfig, option, rel);

  return App(appConfig);
}
