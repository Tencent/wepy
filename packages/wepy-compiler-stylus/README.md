# wepy stylus 编译器

[![npm package](https://nodei.co/npm/wepy-compiler-stylus.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/wepy-compiler-stylus)

> Note: 为了更好的使用 stylus 开发项目，迁移来自[https://github.com/fengxinming/wepy-compiler-stylus](https://github.com/fengxinming/wepy-compiler-stylus)。

---

<p align="center">
  <a href="http://stylus-lang.com/">
    <img alt="Stylus" src="http://stylus-lang.com/img/stylus-logo.svg" width="393"/>
  </a>
</p>

## Table of contents

-   [Features](#features)
-   [Installation](#installation)
-   [Usage](#usage)
-   [Examples](#examples)
-   [Other](#other)

<br/>

## Features

### Support a few advanced features

-   define
-   rawDefine
-   include
-   import
-   includeCSS
-   url

### Original features

-   globals
-   functions
-   use
-   paths
-   filename
-   Evaluator
-   ...

## Installation

```
npm install wepy-compiler-stylus --save-dev

// or

cnpm install wepy-compiler-styl --save-dev
```

## Usage

```
// configure wepy.config.js

module.exports = {
  compilers: {
    styl: {
      compress: true
    }
  }
};
```

## Examples

```javascript
// configure wepy.config.js

module.exports = {
  compilers: {
    styl: {
      supportObject: true,                            // 不是很确定，wepy的作者比较清楚

      // ============= stylus 支持参入的参数 =============
      compress: true,                                 // 压缩
      globals: {                                      // 外部传入全局变量
        isProd: process.env.NODE_ENV === 'production'
      },
      functions: {}                                   // 外部传入全局函数
      use: [],                                        // 导入插件nib、poststylus等
      paths: [],                                      // 将目录暴露给全局
      filename: [],                                   // 设置文件名
      Evaluator: Object,                              // 没用过，我也不知道

      // ============= 扩展属性，兼容gulp-stylus或者stylus-loader的传参
      includeCSS: true,                               // 支持导入css
      define: {                                       // 外部传入全局变量和函数
        isProd: process.env.NODE_ENV === 'production' // 举例：控制不同环境的样式处理
      },
      include: [],                                    // 等价于 paths: [__dirname, __dirname + '/utils']，将目录暴露给全局
      import: [                                       // 将src/css/utils目录下的所有文件加入到编译环境中，其它的styl就不需要@require或者@import该目录下的文件，在该目录下可以定义全局变量、function和mixin等，千万不要把样式放入该目录，否则所有的styl文件都重复包含该样式
        path.join('src', 'css', 'utils', '**/*.styl')
      ],
      url: 'inline-url',                              // 使用base64将图片转码
      url: {
        name: 'inline-url',
        limit: 30000,                                 // 限制多少B以内的图片被压缩
        paths: []                                     // 从指定的目录下查找图片
      },
    }
  }
};
```

## Other

[Stylus](http://www.zhangxinxu.com/jq/stylus/js.php)
