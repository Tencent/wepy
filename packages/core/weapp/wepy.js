import WepyConstructor from './class/WepyConstructor';
import page from './page';
import app from './app';
import component from './component';
import $global from './global';
import { use, mixin } from './apis/index';
import { renderNextTick } from './util/next-tick';


let wepy = WepyConstructor;

Object.assign(wepy, {
  component,
  page,
  app,
  global: $global,

  // global apis
  use,
  mixin,

  nextTick: renderNextTick,
  version: __VERSION__,
  config: {},
});


export default wepy;
