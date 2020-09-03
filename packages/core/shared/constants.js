export const WEAPP_APP_LIFECYCLE = [
  'onLaunch',
  'onShow',
  'onHide',
  'onError',
  'onPageNotFound',
  'onUnhandledRejection',
  'onThemeChange'
];

export const WEAPP_PAGE_LIFECYCLE = [
  'onLoad',
  'onShow',
  'onReady',
  'onHide',
  'onUnload',
  'onPullDownRefresh',
  'onReachBottom',
  'onShareAppMessage',
  'onAddToFavorites',
  'onPageScroll',
  'onResize',
  'onTabItemTap',
  'onShareTimeline'
];

export const WEAPP_COMPONENT_LIFECYCLE = ['beforeCreate', 'created', 'attached', 'ready', 'moved', 'detached', 'error'];

export const WEAPP_COMPONENT_PAGE_LIFECYCLE = ['show', 'hide', 'resize'];

export const WEAPP_LIFECYCLE = []
  .concat(WEAPP_APP_LIFECYCLE)
  .concat(WEAPP_PAGE_LIFECYCLE)
  .concat(WEAPP_COMPONENT_LIFECYCLE)
  .concat(WEAPP_COMPONENT_PAGE_LIFECYCLE);
