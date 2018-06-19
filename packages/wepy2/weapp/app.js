import { patchAppLifecycle } from './init/index';

export default function app (option, rel) {
  let appConfig = {};

  patchAppLifecycle(appConfig, rel, option);

  return App(appConfig);
}
