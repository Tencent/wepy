# wepy pug/jade编译插件

[![npm package](https://nodei.co/npm/wepy-compiler-pug.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/wepy-compiler-pug)

> Note: 为了更好的使用pug开发项目，迁移来自[https://github.com/fengxinming/wepy-compiler-pug](https://github.com/fengxinming/wepy-compiler-pug)。

---

<p align="center">
  <a href="https://tencent.github.io/wepy/">
    <img alt="WePY" src="http://sem.g3img.com/g3img/zhongshihudong/c2_20170623114249_41503.png" width="210"/>
  </a>
</p>

## Table of contents

  - [Features](#features)
  - [Installation](#installation)
  - [Usage](#usage)

<br/>

## Features

### Supported template engines

  - [jade](https://github.com/visionmedia/jade) [(website)](http://jade-lang.com/)
  - [pug (formerly jade)](https://github.com/pugjs/pug) [(website)](https://pugjs.org)

## installation

```bash
cnpm install wepy-compiler-jade --save-dev

# or

npm install wepy-compiler-jade --save-dev

```


## Usage

```
// configure wepy.config.js

module.exports = {
  compilers: {
    jade: {
      engine: 'jade',            // 默认为pug。如果需要使用 pug 模板，就在此处设置
      enforcePretty: true,       // 默认为false，即：该参数用于模板引擎美化失效时强行美化。
      globalConfig: {            // 这个属性名字可以随便定义，只要在模板中使用相同的名字即可
        imgUrlPrefix: ''
      }
    }
  }
};

// write vue/wpy template

<template lang="pug">
  view
    image(src=`${globalConfig.imgUrlPrefix}/images/xxx.svg`)
</template>    

```
