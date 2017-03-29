## WePY

[![npm version](https://badge.fury.io/js/wepy.svg)](https://badge.fury.io/js/wepy)
[![travis-ci](https://travis-ci.org/wepyjs/wepy.svg?branch=master)](https://travis-ci.org/wepyjs/wepy)
[![Coverage Status](https://coveralls.io/repos/github/wepyjs/wepy/badge.svg?branch=master)](https://coveralls.io/github/wepyjs/wepy?branch=master)
[![Dependency Status](https://david-dm.org/wepyjs/wepy.svg)](https://david-dm.org/wepyjs/wepy)


<p align="center">
  <p align="center"></p>
  <p align="center"></p>
  <p align="center"></p>

  <p align="center">
    <img src="https://cloud.githubusercontent.com/assets/2182004/23608978/d42cd6c8-02a6-11e7-9f2e-eda22a9737c7.png" alt="qrcode">
  </p>

  <p align="center">
     WePY 交流群已满500人，请加 gcaufy-helper 好友或者扫码加好友，验证回复 wepy 按照指引进群。
  </p>
</p>

### 介绍

WePY 是一款让小程序支持组件化开发的框架，通过预编译的手段让开发者可以选择自己喜欢的开发风格去开发小程序。框架的细节优化，Promise，Async Functions的引入都是为了能让开发小程序项目变得更加简单，高效。

同时WePY也是一款成长中的框架，大量吸收借鉴了一些优化前端工具以及框架的设计理念和思想。如果WePY有不足地方，或者你有更好的想法，欢迎提交ISSUE或者PR。


### 特性：

* 类Vue开发风格
* 支持自定义组件开发
* 支持引入NPM包
* 支持Promise
* 支持ES2015+特性，如Async Functions
* 支持多种编译器，Less/Sass/Styus、Babel/Typescript、Pug
* 支持多种插件处理，文件压缩，图片压缩，内容替换等
* 小程序细节优化，如请求列队，事件优化等
* 默认集成 ESLint , 与 Vue 相同的 2 空格、无分号代码规范



### Demo

```
<style lang="less">
    @color: #4D926F;
    .userinfo {
        color: @color;
    }
</style>
<template lang="pug">
    view(class='container')
        view(class='userinfo' @tap='tap')
            mycom(:prop.sync='myprop' @fn='myevent')
            text {{now}}
</template>

<script>
    import wepy from 'wepy';
    import mycom from '../components/mycom';

    export default class Index extends wepy.page {

        components = { mycom };

        data = {
            myprop: {}
        };

        computed = {
            now () { return +new Date(); }
        };
        async onLoad() {
            await sleep(3);
            console.log('Hello World');
        }

        sleep(time) {
            return new Promise((resolve, reject) => setTimeout(() => resolve, time * 1000));
        }
    }
</script>
```



### 安装使用

#### 安装（更新） wepy 命令行工具。

```
npm install wepy-cli -g
```

#### 生成开发示例

```
wepy new myproject
```

#### 开发实时编译

```
wepy build --watch
```

#### 开发者工具使用

1. 使用`微信开发者工具`新建项目，本地开发选择`myproject`目录。
2. `微信开发者工具`-->项目-->关闭ES6转ES5。<font style="color:red">重要：漏掉此项会运行报错。</font>
3. 项目根目录运行`wepy build --watch`，开启实时编译。


### Contributing

```
# Clone code
git clone git@github.com:wepyjs/wepy.git

# Developing
npm run watch

# Run test case
npm run test
```


### Documentation

https://wepyjs.github.io/wepy/


### Changelog

https://wepyjs.github.io/wepy/#/CHANGELOG

### License

[MIT](https://github.com/wepyjs/wepy/blob/master/LICENSE)