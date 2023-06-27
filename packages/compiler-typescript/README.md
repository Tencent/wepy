# wepy typescript 编译器
# wepy typescript compiler

## Install
## 安装

```
npm install @wepy/compiler-typescript typescript --save-dev
```

## 配置`wepy.config.js`
## Configure `wepy.config.js`

```

const TypeScriptCompiler = require('@wepy/compiler-typescript');


module.exports = {
  "plugins": [
      TypeScriptCompiler()
  ]
};
```

## 参数说明

## Parameter Description

[TypeScript](https://www.typescriptlang.org/docs/handbook/compiler-options.html)

## Contributor
(salehsami017@gmail.com)