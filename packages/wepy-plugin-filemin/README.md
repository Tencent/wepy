# wepy 文件压缩插件

支持css，xml，json的压缩

## 安装

```
npm install wepy-plugin-filemin --save-dev
```

## 配置`wepy.config.js`

```
module.exports.plugins = {
    'filemin': {
        filter: /\.(json|wxml|xml)$/
    }
};
```