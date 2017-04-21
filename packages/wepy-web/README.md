## Todo list for wepy-web


### 优先需求

- [ ] API 实现
- [ ] 组件实现
- [ ] 更多实例 DEMO

### 选择性需求

- [ ] wepy-web-wx 基于 wx jsapi 实现的小程序的API。
- [ ] wepy-web-qq 基于 qq jsapi 实现的小程序的API。

### 已可以在WEB上运行的实例DEMO

- [x] [默认生成模板](https://github.com/wepyjs/wepy/tree/master/packages/wepy-cli/templates/template)
- [x] [wepy-wechat-demo](https://github.com/wepyjs/wepy-wechat-demo)
- [x] 手机充值+ *未开源项目*

### API 实现进度

| API | WEB中可实现 | 已实现 |
| --- | --- | --- |
| wx.request | <b style="color:green">√</b> | <b style="color:green">√</b> |
| wx.setStorage | <b style="color:green">√</b> | <b style="color:green">√</b> |
| wx.setStorageSync | <b style="color:green">√</b> | <b style="color:green">√</b> |
| wx.getStorage | <b style="color:green">√</b> | <b style="color:green">√</b> |
| wx.getStorageSync | <b style="color:green">√</b> | <b style="color:green">√</b> |
| wx.getStorageInfo | <b style="color:green">√</b> | <b style="color:red">×</b> |
| wx.getStorageInfoSync | <b style="color:green">√</b> | <b style="color:red">×</b> |
| wx.removeStorage | <b style="color:green">√</b> | <b style="color:red">×</b> |
| wx.removeStorageSync | <b style="color:green">√</b> | <b style="color:red">×</b> |
| wx.removeStorage | <b style="color:green">√</b> | <b style="color:red">×</b> |
| wx.clearStorage | <b style="color:green">√</b> | <b style="color:red">×</b> |
| wx.clearStorageSync | <b style="color:green">√</b> | <b style="color:green">√</b> |
| wx.getLocation | jsapi | <b style="color:red">×</b> |
| wx.navigateTo | <b style="color:green">√</b> | <b style="color:green">√</b> |
| wx.redirectTo | <b style="color:green">√</b> | <b style="color:green">√</b> |
| wx.switchTab | <b style="color:green">√</b> | <b style="color:green">√</b> |
| wx.navigateBack | <b style="color:green">√</b> | <b style="color:green">√</b> |
| wx.reLaunch | <b style="color:green">√</b> | <b style="color:red">×</b> |
| wx.login | jsapi | wx |


### 组件实现进度

| 组件 | WEB中需要重新实现 | 已实现 |
| view | <b style="color:red">×</b> | div |
| text | <b style="color:red">×</b> | span |
| button | <b style="color:red">×</b> | button |
| input | <b style="color:red">×</b> | input |
| scroll-view | <b style="color:green">√</b> | <b style="color:green">√</b> |






