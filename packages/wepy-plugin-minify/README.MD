# @wepy/plugin-minify 插件

## 安装
```bash
npm install wepy-plugin-minify --save-dev
```

## 配置`wepy.config.js`

```javascript
const WepyPluginMinify = require('wepy-plugin-minify');

module.exports = {
  plugins: [
    // 不传 options默认开启
    WepyMinifyPlugin({ enable: true })
  ],
};
```

## 参数说明

你提供的配置选项 ```options``` 的 enable 字段 用于配置否关闭压缩功能。默认为开启

内部默认配置如下：
```javascript
const options = {
  enabled: false,
  wxml: true,
  wxss: false,
  js: true,
  json: true,
  compress: {
    drop_console: true,
    drop_debugger: true
  },
};
```
