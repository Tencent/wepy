# 小程序框架wepy文档

## 快速入门

### 项目创建与使用

以下安装都通过`npm`安装

**安装（更新） wepy 命令行工具。**

```bash
npm install wepy-cli -g
```

**在开发目录生成开发DEMO。**

```bash
wepy new myproject
```

**切换至项目目录。**

```bash
cd myproject
```

**开发实时编译。**

```bash
wepy build --watch
```
#### 项目目录结构
```
├── dist                   微信开发者工具指定的目录
├── node_modules           
├── src                    代码编写的目录
|   ├── components         组件文件夹（非完整页面）
|   |   ├── com_a.wpy      可复用组件 a
|   |   └── com_b.wpy      可复用组件 b
|   ├── pages              页面文件夹（完整页面）
|   |   ├── index.wpy      页面 index
|   |   └── page.wpy       页面 page
|   └── app.wpy            小程序配置项（全局样式配置、声明钩子等）
└── package.json           package 配置
```

#### 开发使用说明
1. 使用`微信开发者工具`新建项目，本地开发选择`dist`目录。
2. `微信开发者工具` --> 项目 --> 关闭ES6转ES5。
3. 本地项目根目录运行`wepy build --watch`，开启实时编译。

#### Sublime下代码高亮
文件后缀为`.wpy`，可共用`vue`高亮，但需要手动安装。

1. 打开`Sublime->Preferences->Browse Packages..`进入用户包文件夹。
2. 在此文件夹下打开cmd，运行`git clone git@github.com:vuejs/vue-syntax-highlight.git`，无GIT用户可以直接下载[zip包](https://github.com/vuejs/vue-syntax-highlight/archive/master.zip)解压至当前文件夹。
3. 关闭`.wpy`文件重新打开即可高亮。

#### WebStorm下代码高亮
1. 打开`Preferences`，搜索`Plugins`，搜索`Vue.js`插件并安装。
2. 打开`Preferences`，搜索`File Types`，找到`Vue.js Template`，在`Registered Patterns`添加`*.wpy`，即可高亮。

#### Atom下代码高亮
1. 在Atom里先安装vue的语法高亮 - `language-vue`，如果装过了就忽略这一步。
2. 打开`Atom -> Config`菜单。在`core`键下添加：
```
customFileTypes:
   "text.html.vue": [
      "wpy"
   ]
```

### 代码规范：
1. 变量与方法使用尽量使用驼峰式命名，避免使用`$`开头。
   以`$`开头的方法或者属性为框架内建方法或者属性，可以被使用，使用前请[参考API文档](#api)。
2. 入口，页面，组件的命名后缀为`.wpy`。外链的文件可以是其它后缀。
   请参考[wpy文件说明](#wpy文件说明)
3. 使用ES6语法开发。
   框架在ES6下开发，因此也需要使用ES6开发小程序，ES6中有大量的语法糖可以让我们的代码更加简洁高效。
4. 使用Promise：
   框架默认对小程序提供的API全都进行了 Promise 处理，甚至可以直接使用`async/await`等新特性进行开发。
5. 事件绑定语法使用优化语法代替：
   原`bindtap="click"`替换为`@tap="click"`，原`catchtap="click"`替换为`@tap.stop="click"`。更多`@`符用法，参见[组件自定义事件](https://github.com/wepyjs/wepy#组件自定义事件)。
6. 事件传参使用优化后语法代替：
   原`bindtap="click" data-index={{index}}`替换为`@tap="click({{index}})"`。
7. 自定义组件命名应避开微信原生组件以及功能标签`<repeat>`。
   不可以使用`input, button, view, repeat`等命名自定义组件。更多`repeat`用法，参见[循环列表组件引用](https://github.com/wepyjs/wepy#循环列表组件引用)。


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
        <panel>
            <h1 slot="title"></h1>
        </panel>
        <counter1 :num="myNum"></counter1>
        <counter2 :num.sync="syncNum"></counter2>
        <list :item="items"></list>
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
    data = {
        myNum: 50,
        syncNum: 100,
        items: [1, 2, 3, 4]
    }
}
</script>
```

### 3. 支持加载外部NPM包。

在编译过程当中，会递归遍历代码中的`require`然后将对应依赖文件从node_modules当中拷贝出来，并且修改`require`为相对路径，从而实现对外部NPM包的支持。如下图：

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/2182004/20554645/482b0f64-b198-11e6-8d4e-70c92326004f.png">
</p>

### 4. 单文件模式，使得目录结构更加清晰。

<a href="https://mp.weixin.qq.com/debug/wxadoc/dev/framework/structure.html?t=20161107" target="_blank">官方目录结构</a>要求app必须有三个文件`app.json`，`app.js`，`app.wxss`，页面有4个文件 `index.json`，`index.js`，`index.wxml`，`index.wxss`。而且文件必须同名。
所以使用wepy开发前后开发目录对比如下：

官方DEMO：
```
project
├── pages
|   ├── index
|   |   ├── index.json  index 页面配置
|   |   ├── index.js    index 页面逻辑
|   |   ├── index.wxml  index 页面结构
|   |   └── index.wxss  index 页面样式表
|   └── log
|       ├── log.json    log 页面配置
|       ├── log.wxml    log 页面逻辑
|       ├── log.js      log 页面结构
|       └── log.wxss    log 页面样式表
├── app.js              小程序逻辑
├── app.json            小程序公共设置
└── app.wxss            小程序公共样式表
```
使用wepy框架后目录结构：
```
project
└── src
    ├── pages
    |   ├── index.wpy    index 页面配置、结构、样式、逻辑
    |   └── log.wpy      log 页面配置、结构、样式、逻辑
    └──app.wpy           小程序配置项（全局样式配置、声明钩子等）
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
import wepy from 'wepy';

async onLoad() {
    await wepy.login();
    this.userInfo = await wepy.getUserInfo();
}
```

在同时并发10个request请求测试时：

不使用wepy:
<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/2182004/20554651/5185f740-b198-11e6-88f8-45e359090dc3.png" alt="2 small">
  <img src="https://cloud.githubusercontent.com/assets/2182004/20554886/c30e802a-b199-11e6-927d-08cd4e5ed0b0.png" alt="2 small">
</p>

使用wepy后：
<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/2182004/20554663/65704c2e-b198-11e6-8277-abb77e0c7b3e.png">
</p>

## 进阶说明

### wepy.config.js 配置文件说明
执行`wepy new demo`后，会生成类似配置文件。
```javascript

let prod = process.env.NODE_ENV === 'production';

module.exports = {
    'output': 'dist',
    'source': 'src',
    'wpyExt': '.wpy',
    'compilers': {
        less: {
            'compress': true
        },
        /*sass: {
            'outputStyle': 'compressed'
        },*/
        babel: {
            'presets': [
                'es2015',
                'stage-1'
            ],
            'plugins': [
                'transform-export-extensions',
                'syntax-export-extensions',
                'transform-runtime'
            ]
        }
    },
    'plugins': {
    }
};

if (prod) {
    // 压缩sass
    module.exports.compilers['sass'] = {'outputStyle': 'compressed'};

    // 压缩less
    module.exports.compilers['less'] = {'compress': true};

    // 压缩js
    module.exports.plugins = {
        'uglifyjs': {
            filter: /\.js$/,
            config: {
            }
        },
        'imagemin': {
            filter: /\.(jpg|png|jpeg)$/,
            config: {
                'jpg': {
                    quality: 80
                },
                'png': {
                    quality: 80
                }
            }
        }
    };
}

```

**wpyExt：**缺省值为'.wpy'，IDE默认情况下不会对此文件类型高亮，此时可以修改所有文件为`.vue`后缀(因为与vue高亮规则一样)，然后将此选项修改为`.vue`，就能解决部分IDE代码高亮问题。

**compilers：** compilers为`1.3.1`版本之后的功能，如果需要使用其它语法，请先配置`compilers`，然后再安装相应的compilers。目前支持`wepy-compiler-less`，`wepy-compiler-sass`，`wepy-compiler-babel`，`wepy-compiler-pug`。持续开发...
对应compiler请参考各自文档
>**sass：**sass编译配置，参见<a href="https://github.com/sass/node-sass" target="_blank">这里</a>。
>**less：**less编译配置，参见<a href="http://lesscss.org/#using-less-usage-in-code" target="_blank">这里</a>。
>**stylus：**stylus编译配置，参见<a href="http://www.zhangxinxu.com/jq/stylus/js.php" target="_blank">这里</a>。
>**babel：**babel编译配置，参见<a href="http://babeljs.io/docs/usage/options/" target="_blank">这里</a>。
>**typescript：**typescript编译配置，参见<a href="https://www.tslang.cn/docs/tutorial.html" target="_blank">这里</a>。

**plugins：** plugins为`1.1.6`版本之后功能，目前支持js压缩与图片压缩，`wepy-plugin-ugliyjs`，`wepy-plugin-imagemin`。持续开发...

### 关于compilers和plugins

1.3.1版本新功能，文档建设中...

### wpy文件说明

`wpy`文件的编译过程过下：

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/2182004/22774706/422375b0-eee3-11e6-9046-04d9cd3aa429.png" alt="5 small">
</p>

一个`.wpy`文件分为三个部分：

1. 样式`<style></style>`对应原有`wxss`。
2. 模板`<template></template>`对应原有`wxml`。
3. 代码`<script></script>`对应原有`js`。

其中入口文件`app.wpy`不需要`template`，所以编译时会被忽略。这三个标签都支持`lang`和`src`属性，`lang`决定了其代码编译过程，`src`决定是否外联代码，存在`src`属性且有效时，忽略内联代码，示例如下：
```Html
<style lang="less" src="page1.less"></style>
<template lang="wxml" src="page1.wxml"></template>
<script>
    // some code
</script>
```
标签对应 `lang` 值如下表所示：

| 标签       | lang默认值 | lang支持值                      |
| -------- | ------- | ---------------------------- |
| style    | `css`   | `css`，`less`，`sass`，`stylus` |
| template | `wxml`  | `wxml`，`xml`，`pug(原jade)`    |
| script   | `bable` | `bable`，`TypeScript`         |

### script说明

#### 程序入口app.wpy
```html
<style lang="less">
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
```html
<style lang="less">
/** less **/
</style>
<template lang="wxml">
    <view>
    </view>
    <counter1></counter1>
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

| 属性         | 说明                                       |
| ---------- | ---------------------------------------- |
| config     | 页面config，相当于原来的index.json，同`app.wpy`中的config |
| components | 页面引入的组件列表                                |
| data       | 页面需要渲染的数据                                |
| methods    | wmxl的事件捕捉，如`bindtap`，`bindchange`        |
| events     | 组件之间通过`broadcast`，`emit`传递的事件            |
| 其它         | 如`onLoad`，`onReady`等小程序事件以及其它自定义方法与属性    |

#### 组件com.wpy
```html
<style lang="less">
/** less **/
</style>
<template lang="wxml">
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
小程序支持js<a href="https://mp.weixin.qq.com/debug/wxadoc/dev/framework/app-service/module.html?t=20161107" target="_blank">模块化</a>，但彼此独立，业务代码与交互事件仍需在页面处理。无法实现组件化的松耦合与复用的效果。
例如模板A中绑定一个`bindtap="myclick"`，模板B中同样绑定一样`bindtap="myclick"`，那么就会影响同一个页面事件。对于数据同样如此。因此只有通过改变变量或者事件方法，或者给其加不同前缀才能实现绑定不同事件或者不同数据。当页面复杂之后就十分不利于开发维护。
因此wepy让小程序支持组件化开发，组件的所有业务与功能在组件本身实现，组件与组件之间彼此隔离，上述例子在wepy的组件化开发过程中，A组件只会影响到A绑定的`myclick`，B也如此。

wepy编译组件的过程如下：

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/2182004/22774767/8f090dd6-eee3-11e6-942b-1591a6379ad3.png">
</p>

#### 普通组件引用
当页面或者组件需要引入子组件时，需要在页面或者`script`中的`components`给组件分配唯一id，并且在`template`中添加`<component>`标签。如：

```Html
/**
project
└── src
    ├── coms
    |   └── child.wpy
    ├── pages
    |   ├── index.wpy    index 页面配置、结构、样式、逻辑
    |   └── log.wpy      log 页面配置、结构、样式、逻辑
    └──app.wpy           小程序配置项（全局样式配置、声明钩子等）
**/
// index.wpy
<template>
    <child></child>
</template>
<script>
    import wepy form 'wepy';
    import Child from './coms/child';
    export default class Index extends wepy.component {
        components = {
            child: Child
        };
    }
</script>
```

#### 循环列表组件引用

*1.4.6新增*

当想在`wx:for`中使用组件时，需要使用辅助标签`<repeat>`，如下：

```Html
/**
project
└── src
    ├── coms
    |   └── child.wpy
    ├── pages
    |   ├── index.wpy    index 页面配置、结构、样式、逻辑
    |   └── log.wpy      log 页面配置、结构、样式、逻辑
    └──app.wpy           小程序配置项（全局样式配置、声明钩子等）
**/
// index.wpy
<template>
    <repeat for="{{list}}" key="index" index="index" item="item">
        <child :item="item"></child>
    </repeat>
</template>
<script>
    import wepy form 'wepy';
    import Child from './coms/child';
    export default class Index extends wepy.component {
        components = {
            child: Child
        };
        data = {
            list: [{id: 1, title: 'title1'}, {id: 2, title: 'title2'}]
        }
    }
</script>
```


页面和组件都可以引入子组件，引入若干组件后，如下图：

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/2182004/20554681/796da1ae-b198-11e6-91ab-e90f485c594d.png">
</p>

Index页面引入A，B，C三个组件，同时组件A和B又有自己的子组件D，E，F，G，H。

#### computed 计算属性

* **类型**: `{ [key: string]: Function }`

* **详细**：
计算属性可以直接当作绑定数据，在每次脏检查周期中。在每次脏检查流程中，只要有脏数据，那么`computed` 属性就会重新计算。

* **示例**：

```
data = {
    a: 1
};

computed = {
    aPlus () {
        return this.a + 1;
    }
}
```

#### Props 传值

**静态传值**

使用静态传值时，子组件会接收到字符串的值。

```Javascript
<child title="mytitle"></child>

// child.wpy
props = {
    title: String
};

onLoad () {
    console.log(this.title); // mytitle
}
```

**动态传值**

使用`:prop`（等价于`v-bind:prop`），代表动态传值，子组件会接收父组件的数据。

```Javascript
// parent.wpy
<child :title="parentTitle" :syncTitle.sync="parentTitle" :twoWayTitle="parentTitle"></child>

data = {
    parentTitle: 'p-title'
};


// child.wpy
props = {
    title: String,
    syncTitle: {
        type: String,
        default: 'null'
    },
    twoWayTitle: {
        type: Number,
        default: 50,
        twoWay: true
    }
};

onLoad () {
    console.log(this.title); // p-title
    console.log(this.syncTitle); // p-title
    console.log(this.twoWayTitle); // 50

    this.title = 'c-title';
    console.log(this.$parent.parentTitle); // p-title.
    this.twoWayTitle = 60;
    console.log(this.$parent.parentTitle); // 60.  --- twoWay为true时，子组件props修改会改变父组件对应的值
    this.$parent.parentTitle = 'p-title-changed';
    console.log(this.title); // 'p-title';
    console.log(this.syncTitle); // 'p-title-changed' --- 有sync属性的props，当父组件改变时，会影响子组件的值。
}
```

#### 组件通信与交互
`wepy.component`基类提供三个方法`$broadcast`，`$emit`，`$invoke`，因此任一页面或任一组件都可以调用上述三种方法实现通信与交互，如：
```js
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
        'some-event': (p1, p2, p3, $event) => {
               console.log(`${this.name} receive ${$event.name} from ${$event.source.name}`);
        }
    };
    // Other properties
}
```
**$broadcast**
`$broadcast`事件是由父组件发起，所有子组件都会收到此广播事件，除非事件被手动取消。事件广播的顺序为广度优先搜索顺序，如上图，如果`Page_Index`发起一个`$broadcast`事件，那么接收到事件的先后顺序为：A, B, C, D, E, F, G, H。如下图：

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/2182004/20554688/800089e6-b198-11e6-84c5-352d2d0e2f7e.png">
</p>

**$emit**
`$emit`与`$broadcast`正好相反，事件发起组件的父组件会依次接收到`$emit`事件，如上图，如果E发起一个`$emit`事件，那么接收到事件的先后顺序为：A, Page_Index。如下图：

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/2182004/20554704/9997932c-b198-11e6-9840-3edae2194f47.png">
</p>

**$invoke**
`$invoke`是一个组件对另一个组件的直接调用，通过传入的组件路径找到相应组件，然后再调用其方法。
如果想在`Page_Index`中调用组件A的某个方法：
```Javascript
this.$invoke('ComA', 'someMethod', 'someArgs');
```
如果想在组件A中调用组件G的某个方法：
```Javascript
this.$invoke('./../ComB/ComG', 'someMethod', 'someArgs');
```

#### 组件自定义事件

*1.4.8新增*

可以使用`@customEvent.user`绑定用户自定义组件事件。

其中，`@`表示事件修饰符，`customEvent` 表示事件名称，`.user`表示事件后缀。

目前有三种后缀：

- `.default`: 绑定小程序冒泡事件事件，如`bindtap`。

- `.stop`: 绑定小程序非冒泡事件，如`catchtap`。

- `.user`: 绑定用户自定义组件事件，通过`$emit`触发。

示例如下：

```Html
// index.wpy
<template>
    <child @childFn.user="parentFn"></child>
</template>
<script>
    import wepy form 'wepy';
    import Child from './coms/child';
    export default class Index extends wepy.page {
        components = {
            child: Child
        };

        methods = {
            parentFn (num, evt) {
                console.log('parent received emit event, number is: ' + num)
            }
        }
    }
</script>


// child.wpy
<template>
    <view @tap="tap">Click me</view>
</template>
<script>
    import wepy form 'wepy';
    export default class Child extends wepy.component {
        methods = {
            tap () {
                console.log('child is clicked');
                this.$emit('childFn', 100);
            }
        }
    }
</script>
```


#### 组件内容分发slot

可以使用`<slot>`元素作为组件内容插槽，在使用组件时，可以随意进行组件内容分发，参看以下示例：

在`Panel`组件中有以下模板：

```Html
<view class="panel">
    <slot name="title">默认标题</slot>
    <slot>
        默认内容
    </slot>
</view>
```

在父组件使用`Pannel`组件时，可以这样使用：

```Html
<panel>
    <view>
        <text>这是我放到的内容</text>
    </view>
    <view slot="title">Panel的Title</view>
</panel>
```

### 第三方组件

wepyjs 允许使用基于wepyjs开发的第三方组件，开发第三方组件规范请参考<a href="https://github.com/wepyjs/wepy-com-toast" target="_blank">wepy-com-toast</a>。


### 混合

混合可以将组之间的可复用部分抽离，从而在组件中使用混合时，可以将混合的数据，事件以及方法注入到组件之中。混合分分为两种：

* 默认式混合
* 兼容式混合

#### 默认式混合

对于组件`data`数据，`components`组件，`events`事件以及其它自定义方法采用**默认式混合**，即如果组件未声明该数据，组件，事件，自定义方法等，那么将混合对象中的选项将注入组件这中。对于组件已声明的选项将不受影响。
```Javascript
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

```Javascript
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

### 拦截器

可以使用全域拦截器配置API的config、fail、success、complete方法，参考示例：

```javascript

import wepy from 'wepy';

export default class extends wepy.app {

    constructor () {
        this.intercept('request', {
            config (p) {
                p.timestamp = +new Date();
                return p;
            },
            success (p) {
                console.log('request success');
                return p;
            },
            fail (p) {
                console.log('request error');
                return p;
            }
        });
    }
}
```


### 数据绑定

#### 小程序数据绑定方式
小程序通过`Page`提供的`setData`方法去绑定数据，如：
```Javascript
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

<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/2182004/20554709/a0d8b1e8-b198-11e6-9034-0997b33bdf95.png">
</p>

### 其它优化细节

#### 1. wx.request 接收参数修改
点这里查看<a href="https://mp.weixin.qq.com/debug/wxadoc/dev/api/network-request.html?t=20161122" target="_blank">官方文档</a>
```javascript
// 官方
wx.request({
    url: 'xxx',
    success: function (data) {
        console.log(data);
    }
});

// wepy 使用方式
wepy.request('xxxx').then((d) => console.log(d));
```

#### 2. 优化事件参数传递
点这里查看<a href="https://mp.weixin.qq.com/debug/wxadoc/dev/framework/view/wxml/event.html?t=20161122" target="_blank">官方文档</a>
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
    tapName (id, title, other, event) {
        console.log(id, title, other)// output: 1, wepy, otherparams
    }
}

// wepy 1.1.8以后的版本，只允许传string。
<view bindtap="tapName({{index}}, 'wepy', 'otherparams')"> Click me! </view>

events: {
    tapName (id, title, other, event) {
        console.log(id, title, other)// output: 1, wepy, otherparams
    }
}
```

#### 3. 改变数据绑定方式
保留setData方法，但不建议使用setData执行绑定，修复传入`undefined`的bug，并且修改入参支持：
`this.setData(target, value)`
`this.setData(object)`

点这里查看<a href="https://mp.weixin.qq.com/debug/wxadoc/dev/framework/view/wxml/template.html?t=20161122" target="_blank">官方文档</a>
```Html
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

点这里查看<a href="https://mp.weixin.qq.com/debug/wxadoc/dev/framework/view/wxml/data.html?t=20161122" target="_blank">官方文档</a>
```html
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

