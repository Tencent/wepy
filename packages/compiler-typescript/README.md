# wepy typescript 编译器

## 安装

```
npm install @wepy/compiler-typescript typescript --save-dev
```

## 配置`wepy.config.js`

```

const TypeScriptCompiler = require('@wepy/compiler-typescript');


module.exports = {
  "plugins": [
      TypeScriptCompiler()
  ]
};
```

## 参数说明

[TypeScript](https://www.typescriptlang.org/docs/handbook/compiler-options.html)
