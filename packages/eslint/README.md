# wepy eslint 编译器

## 安装

```
npm install @wepy/eslint --save-dev
```

## 配置`wepy.config.js`

```
const eslint = require('@wepy/eslint');

module.exports = {
    plugins: [
			eslint()
		]
};
```

## 参数说明

[Eslint](https://eslint.org/docs/developer-guide/nodejs-api#cliengine)