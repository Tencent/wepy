# 小程序框架wepy文档

[![npm version](https://badge.fury.io/js/wepy.svg)](https://badge.fury.io/js/wepy)
[![travis-ci](https://travis-ci.org/wepyjs/wepy.svg?branch=master)](https://travis-ci.org/wepyjs/wepy)
[![Coverage Status](https://coveralls.io/repos/github/wepyjs/wepy/badge.svg?branch=master)](https://coveralls.io/github/wepyjs/wepy?branch=master)
[![Dependency Status](https://david-dm.org/wepyjs/wepy.svg)](https://david-dm.org/wepyjs/wepy)


![wepy_group](https://cloud.githubusercontent.com/assets/2182004/21045917/35ffc6ac-be3d-11e6-8387-d8eb3f737b71.jpg)

扫码加入wepyjs体验交流群。

[点此查看CHANGELOG](https://github.com/wepyjs/wepy/blob/master/CHANGELOG.md)

## 快速入门

### 项目创建与使用

#### 安装wepy
以下安装都通过`npm`安装

安装 wepy 命令行工具。
 
```bash
npm install wepy-cli -g
```

在开发目录生成开发DEMO。
 
```bash
wepy new myproject
```

切换至项目目录。

```bash
cd myproject
```

开发实时编译。

```bash
wepy build --watch
```
#### 项目目录结构
```
    dist
    node_modules
    src
        components
            com_a.wpy
            com_b.wpy
        pages
            index.wpy
            page2.wpy
        app.wpy
    package.json
```

#### 开发使用说明
1. 使用`微信开发者工具`新建项目，本地开发选择`dist`目录。
2. `微信开发者工具` --> 项目 --> 关闭ES6转ES5。
3. 本地项目根目录运行`wepy build --watch`，开启实时编译。


###代码规范：
1. 变量与方法使用尽量使用驼峰式命名，避免使用`$`开头。
以`$`开头的方法或者属性为框架内建方法或者属性，可以被使用，使用前请[参考API文档](#api)。
2. 入口，页面，组件的命名后缀为`.wpy`。外链的文件可以是其它后缀。
请参考[wpy文件说明](#wpy文件说明)
3. 使用ES6语法开发。
框架在ES6下开发，因此也需要使用ES6开发小程序，ES6中有大量的语法糖可以让我们的代码更加简洁高效。
4. 使用Promise
框架默认对小程序提供的API全都进行了 Promise 处理，甚至可以直接使用`async/await`等新特性进行开发。


## 主要解决问题：
### 1. 开发模式转换
在原有的小程序的开发模式下进行再次封装，更贴近于现有MVVM框架开发模式。框架在开发过程中参考了一些现在框架的一些特性，并且融入其中，以下是使用wepy前后的代码对比图。

官方DEMO代码：
```javascript
//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: 'Hello World',
    userInfo: {}
  },
  //事件处理函数
  bindViewTap: function() {
    console.log('button clicked')
  },
  onLoad: function () {
    console.log('onLoad')
  }
})
```

基于wepy的实现：
```javascript
import wepy from 'wepy';

export default class Index extends wepy.page {

    data = {
        motto: 'Hello World',
        userInfo: {}
    };
    methods = {
        bindViewTap () {
            console.log('button clicked');
        }
    };
    onLoad() {
        console.log('onLoad');
    };
}
```
### 2. 支持组件化开发。

参见章节：[组件](#组件)
示例代码：
```html
// index.wpy
<template>
    <view>
        <component id="pannel" path="pannel"></component>
        <component id="counter1" path="counter"></component>
        <component id="counter2" path="counter"></component>
        <component id="list" path="list"></component>
    </view>
</template>
<script>
import wepy from 'wepy';
import List from '../components/list';
import Panel from '../components/panel';
import Counter from '../components/counter';

export default class Index extends wepy.page {

    config = {
        "navigationBarTitleText": "test"
    };
    components = {
        panel: Panel,
        counter1: Counter,
        counter2: Counter,
        list: List
    };
}
</script>
```

### 3. 支持加载外部NPM包。

在编译过程当中，会递归遍历代码中的`require`然后将对应依赖文件从node_modules当中拷贝出来，并且修改`require`为相对路径，从而实现对外部NPM包的支持。如下图：

![npm](https://cloud.githubusercontent.com/assets/2182004/20554645/482b0f64-b198-11e6-8d4e-70c92326004f.png)

### 4. 单文件模式，使得目录结构更加清晰。

[官方目录结构](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/structure.html?t=20161107)要求app必须有三个文件`app.json`，`app.js`，`app.wxss`，页面有4个文件 `index.json`，`index.js`，`index.wxml`，`index.wxss`。而且文件必须同名。
所以使用wepy开发前后开发目录对比如下：
官方DEMO：
```
project
    pages
        index
            index.json
            index.js
            index.wxml
            index.wxss
        log
            log.json
            log.wxml
            log.js
            log.wxss
    app.js
    app.json
    app.wxss
```
使用wepy框架后目录结构：
```
project
    src
        pages
            index.wpy
            log.wpy
        app.wpy
```

### 5. 默认使用babel编译，支持ES6/7的一些新特性。

用户可以通过修改`wepy.config.js`(老版本使用`.wepyrc`)配置文件，配置自己熟悉的babel环境进行开发。默认开启使用了一些新的特性如`promise`，`async/await`等等。

示例代码：
```javascript
import wepy from 'wepy';

export default class Index extends wepy.page {

    getData() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({data: 123});
            }, 3000);
        });
    };
    async onLoad() {
        let data = await this.getData();
        console.log(data.data);
    };
}
```
### 6. 针对原生API进行优化。

对现在API进行promise处理，同时修复一些现有API的缺陷，比如：wx.request并发问题等。
原有代码：
```javascript
onLoad = function () {
    var self = this;
    wx.login({
        success: function (data) {
            wx.getUserInfo({
                success: function (userinfo) {
                    self.setData({userInfo: userinfo});
                }
            });
        }
    });
}
```
基于wepy实现代码：
```javascript
async onLoad() {
    await wx.login();
    this.userInfo = await wx.getUserInfo();
}
```

在同时并发10个request请求测试时：
不使用wepy:

![2 small](https://cloud.githubusercontent.com/assets/2182004/20554651/5185f740-b198-11e6-88f8-45e359090dc3.png)
![3 small](https://cloud.githubusercontent.com/assets/2182004/20554886/c30e802a-b199-11e6-927d-08cd4e5ed0b0.png)

使用wepy后：

![4 small](https://cloud.githubusercontent.com/assets/2182004/20554663/65704c2e-b198-11e6-8277-abb77e0c7b3e.png)



## 进阶说明

### wepy.config.js 配置文件说明
执行`wepy new demo`后，会生成类似配置文件。
```javascript
let prod = process.env.NODE_ENV === 'production';

module.exports = {
  "wpyExt": ".wpy",
  "babel": {
    "presets": [
      "es2015",
      "stage-1"
    ],
    "plugins": [
      "transform-export-extensions",
      "syntax-export-extensions",
      "transform-runtime"
    ]
  }
};


if (prod) {
  // 压缩sass
  module.exports['sass'] = {"outputStyle": "compressed"};
  
  // 压缩less
  module.exports['less'] = {"compress": true};

  // 压缩js
  module.exports.plugins = {
      'UglifyJsPlugin': {
          filter: /\.js$/,
          config: {
              compress: {
                warning: false
              }
          }
      },
      'TestPlugin': {
          filter: /\.wxml$/,
          config: {
          }
      }
  };
}

```

**wpyExt：**缺省值为'.wpy'，IDE默认情况下不会对此文件类型高亮，此时可以修改所有文件为`.vue`后缀(因为与vue高亮规则一样)，然后将此选项修改为`.vue`，就能解决部分IDE代码高亮问题。

**sass：**sass编译配置，参见[这里](https://github.com/sass/node-sass)。

**less：**less编译配置，参见[这里](http://lesscss.org/#using-less-usage-in-code)。

**babel：**babel编译配置，参见[这里](http://babeljs.io/docs/usage/options/)。

**plugins：** plugins为`1.1.6`版本之后功能，目前支持js压缩与图片压缩，持续开发...


### wpy文件说明
`wpy`文件的编译过程过下：

![5 small](https://cloud.githubusercontent.com/assets/2182004/20554671/70a797a0-b198-11e6-8355-b7c234713d0c.png)

一个`.wpy`文件分为三个部分：

1. 样式`<style></style>`对应原有`wxss`。
2. 模板`<template></template>`对应原有`wxml`。
3. 代码`<script></script>`对应原有`js`。

其中入口文件`app.wpy`不需要`template`，所以编译时会被忽略。这三个标签都支持`type`和`src`属性，`type`决定了其代码编译过程，`src`决定是否外联代码，存在`src`属性且有效时，忽略内联代码，示例如下：
```
<style type="less" src="page1.less"></style>
<template type="wxml" src="page1.wxml"></template>
<script>
    // some code
</script>
```
标签对应 `type` 值如下表所示：

| 标签 | type默认值 | type支持值 |
| ---- | ---- | ---- |
|style|`css`|`css`，`less`，`sass（待完成）`|
|template|`wxml`|`wxml`，`xml`，`html（待完成）`|
|script|`js`|`js`，`TypeScript(待完成)`|

### script说明

#### 程序入口app.wpy
```
<style type="less">
/** less **/
</style>
<script>
import wepy from 'wepy';
export default class extends wepy.app {
    config = {
            "pages":[
            "pages/index/index"
        ],
        "window":{
            "backgroundTextStyle": "light",
            "navigationBarBackgroundColor": "#fff",
            "navigationBarTitleText": "WeChat",
            "navigationBarTextStyle": "black"
        }
    };
    onLaunch() {
        console.log(this);
    }
}
</script>
```
入口`app.wpy`继承自`wepy.app`，包含一个`config`属性和其全局属性、方法、事件。其中`config`属性对应原有的`app.json`，编译时会根据`config`生成`app.json`文件，如果需要修改`config`中的内容，请使用系统提供API。

#### 页面index.wpy
```
<style type="less">
/** less **/
</style>
<template type="wxml">
    <view>
    </view>
    <component id="counter1" path="counter"></component>
</template>
<script>
import wepy form 'wepy';
import Counter from '../components/counter';
export default class Index extends wepy.page {

    config = {};
    components = {counter1: Counter};

    data = {};
    methods = {};

    events = {};
    onLoad() {};
    // Other properties
}
</script>
```
页面入口继承自`wepy.page`，主要属性说明如下：

| 属性 | 说明 |
| ---- | ---- |
|config|页面config，相当于原来的index.json，同`app.wpy`中的config|
|components|页面引入的组件列表|
|data|页面需要渲染的数据|
|methods|wmxl的事件捕捉，如`bindtap`，`bindchange`|
|events|组件之间通过`broadcast`，`emit`传递的事件|
|其它|如`onLoad`，`onReady`等小程序事件以及其它自定义方法与属性|

#### 组件com.wpy
```
<style type="less">
/** less **/
</style>
<template type="wxml">
    <view>  </view>
</template>
<script>
import wepy form 'wepy';
export default class Com extends wepy.component {

    components = {};

    data = {};
    methods = {};

    events = {};
    // Other properties
}
</script>
```
页面入口继承自`wepy.component`，属性与页面属性一样，除了不需要`config`以及页面特有的一些小程序事件等等。

### 组件
小程序支持js[模块化](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/app-service/module.html?t=20161107)引用，也支持[wxml模板](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/view/wxml/template.html?t=20161107)，但彼此独立，业务代码与交互事件仍需在页面处理。无法实现组件化的松耦合与复用的效果。
例如模板A中绑定一个`bindtap="myclick"`，模板B中同样绑定一样`bindtap="myclick"`，那么就会影响同一个页面事件。对于数据同样如此。因此只有通过改变变量或者事件方法，或者给其加不同前缀才能实现绑定不同事件或者不同数据。当页面复杂之后就十分不利于开发维护。
因此wepy让小程序支持组件化开发，组件的所有业务与功能在组件本身实现，组件与组件之间彼此隔离，上述例子在wepy的组件化开发过程中，A组件只会影响到A绑定的`myclick`，B也如此。

#### 组件引用
当页面或者组件需要引入子组件时，需要在页面或者`script`中的`components`给组件分配唯一id，并且在`template`中添加`<component>`标签，如[index.wpy](页面index.wpy)。

页面和组件都可以引入子组件，引入若干组件后，如下图：

![6 small](https://cloud.githubusercontent.com/assets/2182004/20554681/796da1ae-b198-11e6-91ab-e90f485c594d.png)

Index页面引入A，B，C三个组件，同时组件A和B又有自己的子组件D，E，F，G，H。

#### 组件通信与交互
`wepy.component`基类提供三个方法`$broadcast`，`$emit`，`$invoke`，因此任一页面或任一组件都可以调用上述三种方法实现通信与交互，如：
```
$this.$emit('some-event', 1, 2, 3, 4);
```

组件的事件监听需要写在`events`属性下，如：
```javascript
import wepy form 'wepy';
export default class Com extends wepy.component {

    components = {};

    data = {};
    methods = {};

    events = {
        'some-event': ($event, ...args) {
               console.log(`${this.name} receive ${$event.name} from ${$event.source.name}`);
        }
    };
    // Other properties
}
```
1. **$broadcast**
`$broadcast`事件是由父组件发起，所有子组件都会收到此广播事件，除非事件被手动取消。事件广播的顺序为广度优先搜索顺序，如上图，如果`Page_Index`发起一个`$broadcast`事件，那么接收到事件的先后顺序为：A, B, C, D, E, F, G, H。如下图：

![7 small](https://cloud.githubusercontent.com/assets/2182004/20554688/800089e6-b198-11e6-84c5-352d2d0e2f7e.png)


2. **$emit**
`$emit`与`$broadcast`正好相反，事件发起组件的父组件会依次接收到`$emit`事件，如上图，如果E发起一个`$emit`事件，那么接收到事件的先后顺序为：A, Page_Index。如下图：

![8 small](https://cloud.githubusercontent.com/assets/2182004/20554704/9997932c-b198-11e6-9840-3edae2194f47.png)


3. **$invoke**
`$invoke`是一个组件对另一个组件的直接调用，通过传入的组件路径找到相应组件，然后再调用其方法。
如果想在`Page_Index`中调用组件A的某个方法：
```
this.$invoke('ComA', 'someMethod', 'someArgs');
```
如果想在组件A中调用组件G的某个方法：
```
this.$invoke('./../ComB/ComG', 'someMethod', 'someArgs');
```


### 第三方组件

wepyjs 允许使用基于wepyjs开发的第三方组件，开发第三方组件规范请参考[wepy-com-toast](https://github.com/wepyjs/wepy-com-toast)。


### 混合

混合可以将组之间的可复用部分抽离，从而在组件中使用混合时，可以将混合的数据，事件以及方法注入到组件之中。混合分分为两种：

* 默认式混合
* 兼容式混合

#### 默认式混合

对于组件`data`数据，`components`组件，`events`事件以及其它自定义方法采用**默认式混合**，即如果组件未声明该数据，组件，事件，自定义方法等，那么将混合对象中的选项将注入组件这中。对于组件已声明的选项将不受影响。
```
// mixins/test.js
import wepy from 'wepy';

export default class TestMixin extends wepy.page {
    data = {
        foo: 'foo defined by page',
        bar: 'bar defined by testMix'
    };
    methods: {
    tap () {
      console.log('mix tap');
    }
  }
}

// pages/index.wpy
import wepy from 'wepy';
import TestMixin from './mixins/test';

export default class Index extends wepy.mixin {
    data = {
        foo: 'foo defined by index'
    };
    mixins = [TestMixin ];
    onShow() {
    console.log(this.foo); // foo defined by index.
    console.log(this.bar); // foo defined by testMix.
  }
}
```


#### 兼容式混合

对于组件`methods`响应事件，以及小程序页面事件将采用**兼容式混合**，即先响应组件本身响应事件，然后再响应混合对象中响应事件。

```
// mixins/test.js
import wepy from 'wepy';

export default class TestMixin extends wepy.page {
    methods = {
    tap () {
      console.log('mix tap');
    }
  };
    onShow() {
    console.log('mix onshow');
  }
}

// pages/index.wpy
import wepy from 'wepy';
import TestMixin from './mixins/test';

export default class Index extends wepy.mixin {

    mixins = [TestMixin];
    methods = {
    tap () {
      console.log('index tap');
    }
  };
    onShow() {
    console.log('index onshow');
  }
}


// index onshow
// mix onshow
// ----- when tap
// index tap
// mix tap
```

### 数据绑定

#### 小程序数据绑定方式
小程序通过`Page`提供的`setData`方法去绑定数据，如：
```
this.setData({title: 'this is title'});
```
因为小程序架构本身原因，页面渲染层和JS逻辑层分开的，setData操作实际就是JS逻辑层与页面渲染层之间的通信，那么如果在同一次运行周期内多次执行`setData`操作时，那么通信的次数是一次还是多次呢？这个取决于API本身的设计。

#### wepy数据绑定方式
wepy使用脏数据检查对setData进行封装，在函数运行周期结束时执行脏数据检查，一来可以不用关心页面多次setData是否会有性能上的问题，二来可以更加简洁去修改数据实现绑定，不用重复去写setData方法。代码如下：
```javascript
this.title = 'this is title';
```
但需注意，在函数运行周期之外的函数里去修改数据需要手动调用`$apply`方法。如：
```javascript
setTimeout(() => {
    this.title = 'this is title';
    this.$apply();
}, 3000);
```

#### wepy脏数据检查流程
在执行脏数据检查是，会通过`this.$$phase`标识当前检查状态，并且会保证在并发的流程当中，只会有一个脏数据检查流程在运行，以下是执行脏数据检查的流程图：

![9 small](https://cloud.githubusercontent.com/assets/2182004/20554709/a0d8b1e8-b198-11e6-9034-0997b33bdf95.png)

### 其它优化细节

#### 1. wx.request 接收参数修改
点这里查看[官方文档](https://mp.weixin.qq.com/debug/wxadoc/dev/api/network-request.html?t=20161122)
```javascript
// 官方
wx.request({
    url: 'xxx',
    success: function (data) {
        console.log(data);
    }
});

// wepy 使用方式
// request 接口从只接收Object变为可接收String
wx.request('xxxx').then((d) => console.log(d));
```

#### 2. 优化事件参数传递
点这里查看[官方文档](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/view/wxml/event.html?t=20161122)
```javascript
// 官方
<view data-id="{{index}}" data-title="wepy" data-other="otherparams" bindtap="tapName"> Click me! </view>
Page({
  tapName: function(event) {
    console.log(event.currentTarget.dataset.id)// output: 1
    console.log(event.currentTarget.dataset.title)// output: wepy
    console.log(event.currentTarget.dataset.other)// output: otherparams
  }
});

// wepy 建议传参方式
<view data-wepy-params="{{index}}-wepy-otherparams" bindtap="tapName"> Click me! </view>

events: {
  tapName (event, id, title, other) {
    console.log(id, title, other)// output: 1, wepy, otherparams
  }
}

// wepy 1.1.8以后的版本，只允许传string。
<view bindtap="tapName({{index}}, 'wepy', 'otherparams')"> Click me! </view>

events: {
  tapName (event, id, title, other) {
    console.log(id, title, other)// output: 1, wepy, otherparams
  }
}
```

#### 3. 改变数据绑定方式
保留setData方法，但不建议使用setData执行绑定，修复传入`undefined`的bug，并且修改入参支持：
`this.setData(target, value)`
`this.setData(object)`

点这里查看[官方文档](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/view/wxml/template.html?t=20161122)
```
// 官方
<view> {{ message }} </view>

onLoad: function () {
    this.setData({message: 'hello world'});
}


// wepy
<view> {{ message }} </view>

onLoad () {
    this.message = 'hello world';
}
```

#### 4. 组件代替模板和模块

点这里查看[官方文档](https://mp.weixin.qq.com/debug/wxadoc/dev/framework/view/wxml/data.html?t=20161122)
```
// 官方
<!-- item.wxml -->
<template name="item">
  <text>{{text}}</text>
</template>

<!-- index.wxml -->
<import src="item.wxml"/>
<template is="item" data="{{text: 'forbar'}}"/>

<!-- index.js -->
var item = require('item.js')




// wepy
<!-- /components/item.wpy -->
 <text>{{text}}</text>

<!-- index.wpy -->
<template>
    <component id="item"></component>
</template>
<script>
    import wepy from 'wepy';
    import Item from '../components/item';
    export default class Index extends wepy.page {
        components = { Item }
    }
</script>

```

## API

### wepy.event

|父类 | 无 |
| ---- | ---- | 

| 属性 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
| name | String | - | 事件名称 |
| source | wepy.component | - | 事件来源 |
| type | String | - | emit 或者 broadcast |

| 方法 | 参数 | 返回值 | 说明|
| ---- | ---- | ---- | ---- |
| destroy | - | - | 在 emit 或者 broadcast 过程中，调用destroy方法将会停止事件传播。|

### wepy.component

|父类 | 无 |
| ---- | ---- |

| 属性 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
| isComponent | Boolean | true | 是否是组件，如果是页面，此值为false |
| prefix | String | '' | 组件前缀，组件前缀+组件方法属性才是在小程序中真实存在的方法或属性。 |
| $root | wepy.page | - | 根组件，一般都是页面 |
| $parent | wepy.component | - | 父组件 |
| $wxpage | Page | - | 小程序Page对象 |
| $coms | List(wepy.component) | {} | 子组件列表 |

| 方法 | 参数 | 返回值 | 说明|
| ---- | ---- | ---- | ---- |
| init | - | - | 组件初始化。|
| getWxPage | - | Page | 返回小程序Page对象。|
| $getComponent | path(String) | wepy.component | 通过组件路径返回组件对象。|
| $invoke | com(String/wepy.component), method(String), [args] | - | 调用其它组件方法 |
| $broadcast | evtName(String), [args] | - | broadcast事件。|
| $emit | evtName(String), [args] | - | emit事件。|
| $apply | fn(Function) | - | 准备执行脏数据检查。|
| $digest | - | - | 脏检查。|
### wepy.page

|父类 | wepy.component |
| ---- | ---- |

| 属性 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |

| 方法 | 参数 | 返回值 | 说明|
| ---- | ---- | ---- | ---- |
| init | - | - | 页面始化。|

### wepy.app

|父类 | 无 |
| ---- | ---- |

| 属性 | 类型 | 默认值 | 说明 |
| ---- | ---- | ---- | ---- |
|$wxapp|App|-|小程序getApp()|
| init | - | - | 应用始化包括对原生API的改造与优化|
