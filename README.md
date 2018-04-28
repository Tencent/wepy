## WePY

[![npm version](https://badge.fury.io/js/wepy.svg)](https://badge.fury.io/js/wepy)
[![travis-ci](https://travis-ci.org/Tencent/wepy.svg?branch=master)](https://travis-ci.org/Tencent/wepy)
[![Coverage Status](https://coveralls.io/repos/github/Tencent/wepy/badge.svg?branch=master)](https://coveralls.io/github/Tencent/wepy?branch=master)
[![Dependency Status](https://david-dm.org/Tencent/wepy.svg)](https://david-dm.org/Tencent/wepy)

### 介绍

WePY资源汇总：[awesome-wepy](https://github.com/aben1188/awesome-wepy)

WePY (发音: /'wepi/)是一款让小程序支持组件化开发的框架，通过预编译的手段让开发者可以选择自己喜欢的开发风格去开发小程序。框架的细节优化，Promise，Async Functions的引入都是为了能让开发小程序项目变得更加简单，高效。

同时WePY也是一款成长中的框架，大量吸收借鉴了一些优化前端工具以及框架的设计理念和思想。如果WePY有不足地方，或者你有更好的想法，欢迎提交ISSUE或者PR。


### 特性：

* 类Vue开发风格
* 支持自定义组件开发
* 支持引入NPM包
* 支持[Promise](https://github.com/wepyjs/wepy/wiki/wepy%E9%A1%B9%E7%9B%AE%E4%B8%AD%E4%BD%BF%E7%94%A8Promise)
* 支持ES2015+特性，如[Async Functions](https://github.com/wepyjs/wepy/wiki/wepy%E9%A1%B9%E7%9B%AE%E4%B8%AD%E4%BD%BF%E7%94%A8async-await)
* 支持多种编译器，Less/Sass/Stylus/PostCSS、Babel/Typescript、Pug
* 支持多种插件处理，文件压缩，图片压缩，内容替换等
* 支持 Sourcemap，ESLint等
* 小程序细节优化，如请求列队，事件优化等


### Demo

```html
<style lang="less">
    @color: #4D926F;
    .userinfo {
        color: @color;
    }
</style>
<template lang="pug">
    view(class='container')
        view(class='userinfo' @tap='tap')
            mycom(:prop.sync='myprop' @fn.user='myevent')
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
            return new Promise((resolve, reject) => setTimeout(resolve, time * 1000));
        }
    }
</script>
```



### 安装使用

#### 安装（更新） wepy 命令行工具。

```console
npm install wepy-cli -g
```

#### 生成开发示例

```console
wepy init standard myproject
```

#### 开发实时编译

```console
wepy build --watch
```

#### 开发者工具导入项目

使用`微信开发者工具`新建项目，本地开发选择项目根目录，会自动导入项目配置。

### 哪些小程序是用 WePY 开发的

手机充值+、
手机余额查询、
手机流量充值优惠、
[友福图书馆](https://library.ufutx.com)[（开源）](https://github.com/glore/library)、
[素洁商城](https://github.com/dyq086/wxYuHanStore)[（开源）](https://github.com/dyq086/wxYuHanStore)、
[NewsLite](https://github.com/yshkk/shanbay-mina)[（开源）](https://github.com/yshkk/shanbay-mina)、
[西安找拼车](https://github.com/chenqingspring)[（开源）](https://github.com/chenqingspring)、
[深大的树洞](https://github.com/jas0ncn/szushudong)[（开源）](https://github.com/jas0ncn/szushudong)、
[求知微阅读](https://github.com/KingJeason/wepy-books)[（开源）](https://github.com/KingJeason/wepy-books)、
[给你的 iPhone X 换个发型](https://bangs.baran.wang/)、
[天天跟我买](http://www.xiaohongchun.com.cn/index)、
[坚橙](https://zhanart.com/wepy.html)、
群脱单、
米淘联盟、
帮助圈、
众安保险福利、
阅邻二手书、
趣店招聘、
[满熊阅读（开源：](https://github.com/Thunf/wepy-demo-bookmall) [微信小程序](https://github.com/Thunf/wepy-demo-bookmall)、[支付宝小程序）](https://github.com/Thunf/wepy-demo-bookmall/tree/alipay)、
育儿柚道、
平行进口报价内参、
GitHub掘金版、
班级群管、
鲜花说小店、
逛人备忘、
英语助手君、
花花百科、
独角兽公司、
爱羽客羽毛球、
斑马小店、
小小羽球、
培恩医学、
农资优选、
公务员朝夕刷题、
七弦琴小助手、
七弦琴大数据、
爽到家小程序、
[应用全球排行](https://github.com/szpnygo/wepy_ios_top)[（开源）](https://github.com/szpnygo/wepy_ios_top)、
[we川大](https://github.com/mohuishou/scuplus-wechat)[（开源）](https://github.com/mohuishou/scuplus-wechat)、
...

### 交流群
 
 WePY 交流群已满500人，请加 gcaufy_helper 好友或者扫码加好友，验证回复 `wepy` 按照指引进群。

 ![wepy_qr_code](https://user-images.githubusercontent.com/2182004/32309877-8bded674-bfc9-11e7-9daa-9ba4012690fb.png)


### Links

[Documentation](https://tencent.github.io/wepy/)

[Changelog](https://tencent.github.io/wepy/document.html#/changelog)

[Contributing](https://github.com/tencent/wepy/blob/master/CONTRIBUTING.md)

[License MIT](https://github.com/tencent/wepy/blob/master/LICENSE)

