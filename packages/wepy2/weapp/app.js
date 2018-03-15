import Base from './base';
import $global from './global';
import { initAppLifecycle } from './init/lifecycle';

class WepyApp extends Base {

  constructor () {

  }

  $init (option) {
    let appConfig = {};

    this.$option = option;

    initAppLifecycle(this, appConfig);

    return appConfig;
  }
}

export default function app (options) {
  let app = new WepyApp();
  $global.$app = app;

  let appConfig = app.$init(options);
  return App(appConfig);
}
