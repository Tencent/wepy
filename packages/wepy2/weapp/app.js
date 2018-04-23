import { patchAppLifecycle } from './init/index';

export default function app (option) {
  let appConfig = {};

  patchAppLifecycle(appConfig, option);

  return App(appConfig);
}
