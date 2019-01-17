'use strict';

/**
 * Promisify a callback function
 * @param  {Function} fn     callback function
 * @param  {Object}   caller caller
 * @param  {String}   type   weapp-style|error-first, default to weapp-style
 * @return {Function}        promisified function
 */
var promisify = function (fn, caller, type) {
  if ( type === void 0 ) type = 'weapp-style';

  return function () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return new Promise(function (resolve, reject) {
      switch (type) {
        case 'weapp-style':
          fn.call(caller, Object.assign({}, args[0],
            {
              success: function success (res) {
                resolve(res);
              },
              fail: function fail (err) {
                reject(err);
              }
            }));
          break;
        case 'weapp-fix':
          fn.apply(caller, args.concat(resolve).concat(reject));
          break;
        case 'error-first':
          fn.apply(caller, args.concat( [function (err, res) { return (err ? reject(err) : resolve(res)); }])
          );
          break;
      }
    });
  };
};

// The methods no need to promisify
var noPromiseMethods = [
  // 媒体
  'stopRecord',
  'getRecorderManager',
  'pauseVoice',
  'stopVoice',
  'pauseBackgroundAudio',
  'stopBackgroundAudio',
  'getBackgroundAudioManager',
  'createAudioContext',
  'createInnerAudioContext',
  'createVideoContext',
  'createCameraContext',

  // 位置
  'createMapContext',

  // 设备
  'canIUse',
  'startAccelerometer',
  'stopAccelerometer',
  'startCompass',
  'stopCompass',
  'onBLECharacteristicValueChange',
  'onBLEConnectionStateChange',

  // 界面
  'hideToast',
  'hideLoading',
  'showNavigationBarLoading',
  'hideNavigationBarLoading',
  'navigateBack',
  'createAnimation',
  'pageScrollTo',
  'createSelectorQuery',
  'createCanvasContext',
  'createContext',
  'drawCanvas',
  'hideKeyboard',
  'stopPullDownRefresh',

  // 拓展接口
  'arrayBufferToBase64',
  'base64ToArrayBuffer'
];

var simplifyArgs = {
  // network
  'request': 'url',
  'downloadFile': 'url',
  'connectSocket': 'url',
  'sendSocketMessage': 'data',

  // media
  'previewImage': 'urls',
  'getImageInfo': 'src',
  'saveImageToPhotosAlbum': 'filePath',
  'playVoice': 'filePath',
  'playBackgroundAudio': 'dataUrl',
  'seekBackgroundAudio': 'position',
  'saveVideoToPhotosAlbum': 'filePath',

  // files
  'saveFile': 'tempFilePath',
  'getFileInfo': 'filePath',
  'getSavedFileInfo': 'filePath',
  'removeSavedFile': 'filePath',
  'openDocument': 'filePath',

  // device
  'setStorage': 'key,data',
  'getStorage': 'key',
  'removeStorage': 'key',
  'openLocation': 'latitude,longitude',
  'makePhoneCall': 'phoneNumber',
  'setClipboardData': 'data',
  'getConnectedBluetoothDevices': 'services',
  'createBLEConnection': 'deviceId',
  'closeBLEConnection': 'deviceId',
  'getBLEDeviceServices': 'deviceId',
  'startBeaconDiscovery': 'uuids',
  'setScreenBrightness': 'value',
  'setKeepScreenOn': 'keepScreenOn',

  // screen
  'showToast': 'title',
  'showLoading': 'title,mask',
  'showModal': 'title,content',
  'showActionSheet': 'itemList,itemColor',
  'setNavigationBarTitle': 'title',
  'setNavigationBarColor': 'frontColor,backgroundColor',

  // tabBar
  'setTabBarBadge': 'index,text',
  'removeTabBarBadge': 'idnex',
  'showTabBarRedDot': 'index',
  'hideTabBarRedDot': 'index',
  'showTabBar': 'animation',
  'hideTabBar': 'animation',

  // topBar
  'setTopBarText': 'text',

  // navigator
  'navigateTo': 'url',
  'redirectTo': 'url',
  'navigateBack': 'delta',
  'reLaunch': 'url',

  // pageScroll
  'pageScrollTo': 'scrollTop,duration'
};

var makeObj = function (arr) {
  var obj = {};
  arr.forEach(function (v) { return obj[v] = 1; });
  return obj;
};

/*
 * wx basic api promisify
 * useage:
 * wepy.use(wepy-use-promisify)
 * wepy.use(wepy-use-promisify([nopromise1, nopromise2]));
 * wepy.use(wepy-use-promisify({nopromise1: true, promise: false}));
 * wepy.login().then().catch()
 */
var index = {
  install: function install (wepy, removeFromPromisify) {
    var _wx = (wepy.wx = wepy.wx || Object.assign({}, wx));

    var noPromiseMap = {};
    if (removeFromPromisify) {
      if (Array.isArray(removeFromPromisify)) {
        noPromiseMap = makeObj(noPromiseMethods.concat(removeFromPromisify));
      } else {
        noPromiseMap = Object.assign({}, makeObj(noPromiseMethods), removeFromPromisify);
      }
    }

    Object.keys(_wx).forEach(function (key) {
      if (!noPromiseMap[key] && key.substr(0, 2) !== 'on' && key.substr(-4) !== 'Sync') {
        _wx[key] = promisify(function () {
          var args = [], len = arguments.length;
          while ( len-- ) args[ len ] = arguments[ len ];

          var fixArgs = args[0];
          var failFn = args.pop();
          var successFn = args.pop();
          if (simplifyArgs[key] && Object.prototype.toString.call(fixArgs) !== '[object Object]') {
            fixArgs = {};
            var ps = simplifyArgs[key];
            if (args.length) {
              ps.split(',').forEach(function (p, i) {
                if (i in args) {
                  fixArgs[p] = args[i];
                }
              });
            }
          }
          fixArgs.success = successFn;
          fixArgs.fail = failFn;

          return wx[key].call(wx, fixArgs);
        }, _wx, 'weapp-fix');
      }
    });

    wepy.promisify = promisify;
  }
}

module.exports = index;
