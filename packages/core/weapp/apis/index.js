import { use } from './use';
import { mixin } from './mixin';
import { set, del } from '../observer/index';
import { renderNextTick } from '../util/next-tick';
import { app, page, component } from '../native/index';

export function initGlobalAPI (wepy) {

  wepy.use = use;
  wepy.mixin = mixin;

  wepy.set = function (target, key, val) {
    set.apply(wepy, [ undefined, target, key, val]);
  };

  wepy.delete = del;

  wepy.nextTick = renderNextTick;

  wepy.app = app;
  wepy.page = page;
  wepy.component = component;

  return wepy;
}
