# sm-wepy-plugin-file-min 插件

## 安装

```bash
npm install wepy-plugin-file-min --save-dev--save-dev
```
## 配置`wepy.config.js`
```javascript
const FileMinPlugin = require('sm-wepy-plugin-file-min')
// 在末尾添加：
module.exports.plugins.push(FileMinPlugin())
// 关闭压缩功能:
module.exports.plugins.push(FileMinPlugin({ enable: false }))
```
或者根据你配置的环境变量来判断：
```javascript
const isCompress = process.env.COMPRESS === 'compress';
if (isCompress) {
  module.exports.plugins.push(FileMinPlugin({}))
}
```
## 参数说明
你提供的配置选项 ```options``` 的 enable 字段 用于配置否关闭压缩功能。默认为开启
内部默认配置如下：
```javascript
let options = {
  enable: true,
  wxml: true, 
  json: true,
  // 默认不压缩 wxss, 因为大部分开发者有用 less 或 sass 插件， 已经压缩过了 wxss。
  wxss: false
}
```
