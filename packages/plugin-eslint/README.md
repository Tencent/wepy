# wepy eslint 插件

## 安装

```
npm install @wepy/plugin-eslint --save-dev
```

## 配置`wepy.config.js`

```
const eslint = require('@wepy/plugin-eslint');

module.exports = {
  plugins: [
    eslint({
      // options
    })
  ]
};
```

## 参数说明

[Eslint](https://eslint.org/docs/developer-guide/nodejs-api#cliengine)
