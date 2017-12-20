## Todo list for wepy-web

### 使用

```
# 生成web版本
$ wepy build --output web

# 生成微信浏览器版本
$ wepy build --output web --platform wechat

# 生成QQ浏览器版本
$ wepy build --output web --platform qq
```


### 优先需求

- [ ] API 实现
- [ ] 组件实现
- [ ] 更多实例 DEMO

### 选择性需求

- [ 65% ] wepy-web-wechat 基于 wx jsapi 实现的小程序的API。
- [ 70% ] wepy-web-qq 基于 qq jsapi 实现的小程序的API。
- [ -- ] more...。

### 已可以在WEB上运行的实例DEMO

- [x] [默认生成模板](https://github.com/wepyjs/wepy/tree/master/packages/wepy-cli/templates/template)
- [x] [wepy-wechat-demo](https://github.com/wepyjs/wepy-wechat-demo)
- [x] [wepy-weui-demo](https://github.com/wepyjs/wepy-weui-demo)
- [x] 手机充值+ *未开源项目*

### API 实现进度

| API | WEB中可实现 | 已实现 |
| --- | --- | --- |
| wx.request | √ | √ |
| wx.setStorage | √ | √ |
| wx.setStorageSync | √ | √ |
| wx.getStorage | √ | √ |
| wx.getStorageSync | √ | √ |
| wx.getStorageInfo | √ | × |
| wx.getStorageInfoSync | √ | × |
| wx.removeStorage | √ | × |
| wx.removeStorageSync | √ | × |
| wx.removeStorage | √ | × |
| wx.clearStorage | √ | × |
| wx.clearStorageSync | √ | √ |
| wx.getLocation | jsapi | × |
| wx.navigateTo | √ | √ |
| wx.redirectTo | √ | √ |
| wx.switchTab | √ | √ |
| wx.navigateBack | √ | √ |
| wx.reLaunch | √ | × |
| wx.login | jsapi | wx/qq |
| wx.showLoading | √ | √ |
| wx.hideLoading | √ | √ |
| wx.showToast | √ | √ |
| wx.hideToast | √ | √ |
| wx.showModal | √ | √ |
| wx.showActionSheet | √ | √ |


### 组件实现进度

| 组件 | WEB中需要重新实现 | 已实现 |
| --- | --- | --- |
| view | × | div |
| text | × | span |
| button | × | button |
| input | × | input |
| scroll-view | √ | √ |
| icon | √ | √ |
| navigator | √ | √ |
| progress | √ | √ |
| slider | √ | √ |






