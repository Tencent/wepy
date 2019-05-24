export const WEAPP_APP_LIFECYCLE = [
  'onLaunch',
  'onShow',
  'onHide',
  'onError',
  'onPageNotFound'
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
  'onPageScroll',
  'onTabItemTap'
];

export const WEAPP_COMPONENT_LIFECYCLE = [
  'beforeCreate',
  'created',
  'attached',
  'ready',
  'moved',
  'detached'
];

export const WEAPP_LIFECYCLE = [].concat(WEAPP_APP_LIFECYCLE).concat(WEAPP_PAGE_LIFECYCLE).concat(WEAPP_COMPONENT_LIFECYCLE);
