import Page from './libs/Page';
import WepyPage from '../../../weapp/class/WepyPage';
import WepyApp from '../../../weapp/class/WepyApp';

export function createApp(opt = {}) {
  const wepyApp = new WepyApp(opt);
  wepyApp.hooks = {};
  return wepyApp;
}
export function createPage(opt = {}) {
  const wepy = new WepyPage(opt);
  wepy.__pageid = 1;
  wepy.__events = 0;

  wepy.$app = createApp({});
  return wepy;
}

export function createOriginalApp(opt) {
  const app = new App();
  const wepyApp = createApp(opt);
  app.$wepy = wepyApp;
  return app;
}

export function createOriginalPage(opt) {
  const wepy = createPage(opt);
  const page = new Page();
  page.$wepy = wepy;

  return page;
}

export function simulateOriginalEvent(type, opt) {
  if (!opt) {
    opt = {};
  }
  if (!opt.currentTarget || !opt.currentTarget.dataset) {
    opt.currentTarget = {
      dataset: {}
    };
  }
  if (!opt.detail) {
    opt.detail = {};
  }
  opt.type = type;
  return opt;
}

export function simulateOriginalWePYEvent(type, evtid, params) {
  const e = simulateOriginalEvent(type);

  params.forEach((p, i) => {
    const key = 'wpy' + type.toLowerCase() + String.fromCharCode(97 + i).toUpperCase();
    e.currentTarget.dataset[key] = p;
  });

  e.currentTarget.dataset.wpyEvt = evtid;
  return e;
}

export function addEventListener(comp, type, handler) {
  const wepy = comp.$wepy;
  wepy.__events++;
  const evtid = wepy.__pageid + '-' + wepy.__events;

  if (!wepy.$rel) {
    wepy.$rel = { handlers: {} };
  }

  const handlers = wepy.$rel.handlers;
  if (!handlers[evtid]) {
    handlers[evtid] = {};
  }
  handlers[evtid][type] = handler;
  return evtid;
}
