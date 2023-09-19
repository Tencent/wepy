English | [简体中文](./README.md)

## WePY 2 (beta)

[![npm version](https://badge.fury.io/js/wepy.svg)](https://badge.fury.io/js/wepy)
[![travis-ci](https://travis-ci.org/Tencent/wepy.svg?branch=1.7.x)](https://travis-ci.org/Tencent/wepy)
![Github CI](https://github.com/Tencent/wepy/workflows/WePY%20CI%20Build/badge.svg?branch=2.0.x)
[![Coverage Status](https://coveralls.io/repos/github/Tencent/wepy/badge.svg?branch=1.7.x)](https://coveralls.io/github/Tencent/wepy?branch=1.7.x)
[![Dependency Status](https://david-dm.org/Tencent/wepy.svg)](https://david-dm.org/Tencent/wepy)

### Introduce

WePY resource summary: [awesome-wepy](https://github.com/aben1188/awesome-wepy)

WePY (pronounced: /'wepi/) is a framework that enables componentization of small programs by pre-compiling them so that developers can choose their own development style. Detailed optimizations for the framework and the introduction of Promise and Async Functions all aim at making it easier and more efficient to develop applets.

At the same time, WePY is also a growing framework, drawing heavily on the design concepts and ideas of some front-end optimization tools and frameworks. If WePY has a problem, or if you have a better idea, feel free to submit an ISSUE or PR.

### Features:

- Vue-like development style
- Supports custom component development
- Supports introducing NPM packages
- supports [Promise](https://github.com/wepyjs/wepy/wiki/wepy%E9%A1%B9%E7%9B%AE%E4%B8%AD%E4%BD%BF%E7%94%A8Promise)
- Supports ES2015+ features, such as [Async Functions](https://github.com/wepyjs/wepy/wiki/wepy%E9%A1%B9%E7%9B%AE%E4%B8%AD%E4%BD%BF%E7%94%A8async-await)
- Supports multiple compilers: Less/Sass/Stylus/PostCSS, Babel/Typescript, Pug
- Supports a variety of plug-in processing, file compression, image compression, content replacement, etc
- Supports Sourcemap, ESLint, etc
- Small program detailed optimization, such as request queuing, event optimization, etc

### Demo

```html
<style lang="less">
@color: #4D926F;
  .num {
  color: @color;
  }
</style>
<template>
  <div class="container">
    <div class="num" @tap="num++">
      {{num}}
    </div>
    <custom-component></custom-component>
    <vendor-component></vendor-component>
    <div>{{text}}</div>
    <input v-model="text"/>
  </div>
</template>
<config>
{
  usingComponents: {
    customComponent: '@/components/customComponent',
    vendorComponent: 'module:vendorComponent'
  }
}
</config>

<script>
  import wepy from '@wepy/core';

  wepy.page({
    data: {
      num: 0,
      text: 'Hello World',
    },
  });
</script>
```

### Usage

#### Install (upgrade) the WEPY command-line tool.

```bash
npm install @wepy/cli@next -g
```

#### Get start with an example

```console
wepy init standard myproject
```

#### Install dependencies

```console
cd myproject
npm install
```

#### Watch mode

```console
wepy build --watch
```

#### Import project

Create a new project using`WeChat developer tool`.If the local developer selects the project root directory, the project configuration will be automatically imported.

### Which applets are developed with WePY

腾讯疫苗查询小程序、
腾讯翻译君小程序、
腾讯地图小程序、
玩转故宫小程序、
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
GitHub 掘金版、
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
[we 川大](https://github.com/mohuishou/scuplus-wechat)[（开源）](https://github.com/mohuishou/scuplus-wechat)、
聊会儿、
[诗词墨客](https://github.com/huangjianke/weapp-poem)[（开源）](https://github.com/huangjianke/weapp-poem)、
[南京邮电大学](https://github.com/GreenPomelo/Undergraduate)[（开源）](https://github.com/GreenPomelo/Undergraduate)

...

### WeChat group

WePY group has reached 500 members. Please add gcaufy_helper or scan the QR code to add the friend and reply 'wepy' according to the reference to enter the group.

![wepy_qr_code](https://user-images.githubusercontent.com/2182004/82732473-feb50c80-9d3f-11ea-9a5f-0efc6ce40f74.png)

### Contribution

If you have any comments or suggestions, please feel free to contribute to improving the WeChat app-development experience by asking for Issues or Pull Requests.

See details: [CONTRIBUTING.md](./CONTRIBUTING.md)

[Tencent Open Source Incentive Plan](https://opensource.tencent.com/contribution) EncouraTencent Open Source Incentive Plange developers to participate and contribute. Look forward to your participation.

### Links

[Documentation](https://tencent.github.io/wepy/)

[Changelog](https://tencent.github.io/wepy/document.html#/changelog)

[Contributing](./CONTRIBUTING.md)

[License MIT](./LICENSE)
