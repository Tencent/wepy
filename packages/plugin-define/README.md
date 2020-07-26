[English](./README_EN.md) | 简体中文

# wepy define plugin

## 安装

```bash
npm install @wepy/plugin-define --save-dev
```

## 配置方式

**wepy.config.js**

```javascript
const DefinePlugin = require('@wepy/plugin-define');

module.exports = {
  plugins: [
    DefinePlugin({
      BASE_URL: JSON.stringify('http://foobar.com'),
      'process.env.NODE_ENV': 'development',
      'typeof window': JSON.stringify('undefined'),
      DEV: true
    })
  ]
};
```

## 参考网站

[webpack.DefinePlugin](https://webpack.js.org/plugins/define-plugin/)



