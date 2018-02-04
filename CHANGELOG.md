## 1.6.1 (comming soon)
* `A` 添加了`cliLogs`配置项，为`true`时，会将CLI的报错信息注入到代码中，不用切回CLI去查看错误信息。[ISSUE 484](https://github.com/wepyjs/wepy/issues/484)
* `F` 修复了组件使用`scoped`样式时，生成hash不一致的问题。[ISSUE 539](https://github.com/wepyjs/wepy/issues/539)
* `F` 修复了源码目录里有空内容组件编译报错的问题。[ISSUE 538](https://github.com/wepyjs/wepy/issues/538)
* `F` 修复了当模板格式错误时，编译报错的问题。
* `F` 修复了引用带路径的NPM模块时，编译报错的问题。
* `A` 配置文件中添加了`watchOption`参数。
* `F` 修复了repeat中，使用静态props异常的问题。[PR 538](https://github.com/Tencent/wepy/pull/605)
* `F` 修复了同页面跳转，可能会导致数据绑定失效的问题。[ISSUE 621](https://github.com/wepyjs/wepy/issues/621)
* `F` 修复了使用sass语法时，首行不能缩进的问题。[ISSUE 663](https://github.com/wepyjs/wepy/issues/663)
* `F` 修复了引用多个组件实例造成的style重复引用的问题。[ISSUE 639](https://github.com/wepyjs/wepy/issues/639)
* `A` 添加了$nextTick方法，用于作为setData的回调方法。[ISSUE 712](https://github.com/Tencent/wepy/issues/712)

`npm install wepy-cli@1.6.1-alpha3`
* `A` 加入了对小程序分包功能的支持。[ISSUE 707](https://github.com/Tencent/wepy/issues/707)
* `A` 加入了对原生小程序wxs的支持。[ISSUE 713](https://github.com/Tencent/wepy/issues/713)

`npm install wepy-cli@1.6.1-alpha4`

* `F` 修复了template中只有注释会导致终止编译的BUG。[6bbb304](https://github.com/Tencent/wepy/commit/6bbb304e06c28cd9309b17f97c6f6426a075ea99)
* `F` 修复了在onLaunch阶段获取不到`getApp()`的BUG。[ISSUE 753](https://github.com/Tencent/wepy/issues/753)
* `F` 在apply进入死循环时，进行报错提示。[ISSUE 723](https://github.com/Tencent/wepy/issues/723)
* `F` 修复了在使用多级目录作为src目录时，watch会提示找不到文件的问题。[ISSUE 696](https://github.com/Tencent/wepy/issues/696)
* `A` 添加了`onPageScroll`, `onTabItemTap`两个事件，并且可以在config中配置。[ISSUE 793](https://github.com/Tencent/wepy/issues/793)
* `F` 处理小程序版本库`1.9.0`中不再允许设置undefined值的问题。[ISSUE 819](https://github.com/Tencent/wepy/issues/819)
* `A` 添加了`wepy init`和`wepy list`功能，允许使用模板。[PR 833](https://github.com/Tencent/wepy/pull/833)
* `D` 弃用了原来的`wepy new`命令。

`npm install wepy-cli@1.6.1-alpha7`

* `A` 添加了对`capture`语法的支持。[PR 839](https://github.com/Tencent/wepy/pull/839)

`npm install wepy-cli@1.6.1-alpha8`

* `F` 修复了使用alias会导致修改子组件不触发父组件编译的BUG。[ISSUE 903](https://github.com/Tencent/wepy/issues/903)
* `F` 修复了在子组件中使用wxs会导致子组件的class属性绑定到wxs节点的BUG。[ISSUE 907](https://github.com/Tencent/wepy/issues/907)

## 1.6.0 (2017-10-25) 
* `F` 修复了`@import scss`编译出错的问题。[ISSUE 303](https://github.com/wepyjs/wepy/issues/303)
* `F` 修复了在repeat中使用静态传值不生效的问题。[ISSUE 204](https://github.com/wepyjs/wepy/issues/204)
* `F` 修复了使用绝对路径跳转时，`onPrefetch`没被调用的问题。[ISSUE 244](https://github.com/wepyjs/wepy/issues/244)
* `F` 修复了在组件中没有`<style>`节点报错的BUG。[ISSUE 160](https://github.com/wepyjs/wepy/issues/160)
* `F` 修复了repeat中for变量为null或者undefined报错的问题。[PR 353](https://github.com/wepyjs/wepy/pull/353)
* `A` 添加了computed的watch和sync功能。[ISSUE 318](https://github.com/wepyjs/wepy/issues/318)
* `F` 修复了`--watch`模式下，修复外链文件可能不会触发编译的问题。
* `F` 修复了repeat中传多个参数无效的BUG。[ISSUE 348](https://github.com/wepyjs/wepy/issues/348)
* `D` 弃用babel-preset-2015。[ISSUE 407](https://github.com/wepyjs/wepy/issues/407)
* `F` 修复引用第三方私有NPM组件编译报错的问题。[PR 398](https://github.com/wepyjs/wepy/pull/398)
* `F` 修复getCurrentPages调用错误的问题。[PR 396](https://github.com/wepyjs/wepy/pull/396)
* `F` 修复使用repeat时，默认数据为空引发的BUG。[PR 411](https://github.com/wepyjs/wepy/pull/411)
* `F` 修复了使用第三方组件时，修改ouput属性导致引用错乱的BUG。[ISSUE 415](https://github.com/wepyjs/wepy/pull/415)
* `A` 添加了`resolve`, `alias`的功能
* `F` 修复了生成JSON时没有通过plugins处理的问题。[ISSUE 403](https://github.com/wepyjs/wepy/pull/403)
* `F` 修复了组件中引用相对路径在某些情况下不准确的问题。[ISSUE 345](https://github.com/wepyjs/wepy/pull/345)
* `F` 修复了repeat使用驼峰命名组件出现问题的BUG。[ISSUE 397](https://github.com/wepyjs/wepy/pull/397)
* `F` 修复绑定多个事件传参时，参数混乱的问题。[ISSUE 385](https://github.com/wepyjs/wepy/pull/385)

## 1.5.8 (2017-08-05)
* `A` 添加了`appConfig`字段。[ISSUE 199](https://github.com/wepyjs/wepy/issues/199)
* `F` 修复了使用缩进的`sass`语法时编译报错的问题。[ISSUE 208](https://github.com/wepyjs/wepy/issues/208)
* `F` 修复了使用PUG编译时，首行不能缩进的问题。[ISSUE 211](https://github.com/wepyjs/wepy/issues/211)
* `A` 添加组件 kebab-case 写法支持。[ISSUE 242](https://github.com/wepyjs/wepy/issues/242)
* `F` 修复了当项目文件夹存在空文件时编译会卡死的问题。[ISSUE 253](https://github.com/wepyjs/wepy/issues/253)
* `A` 添加了组件对`class`的支持。[ISSUE 255](https://github.com/wepyjs/wepy/issues/255)
* `F` 修复了页面中使用`:class`无效的BUG。[ISSUE 257](https://github.com/wepyjs/wepy/issues/257)

## 1.5.7 (2017-06-15)
* `F` 修复了`App`中的`this`指向问题。
* `F` 修复了`component`不支持mixin的onLoad的问题。[ISSUE 177](https://github.com/wepyjs/wepy/issues/177)
* `F` 修复了引用第三方组件时，样式引用路径不对的问题。
* `F` 修复了使用`pug`时，`props`不生效的问题。[ISSUE 186](https://github.com/wepyjs/wepy/issues/186)
* `F` 修复了使用扩展运算符`...`时，编译不正确的问题。[ISSUE 190](https://github.com/wepyjs/wepy/issues/190)
* `F` 修复了目录中包含src时，第三方组件编译路径不正确的问题。[ISSUE 183](https://github.com/wepyjs/wepy/issues/183)
* `A` 添加数据的`watch`支持。[ISSUE 155](https://github.com/wepyjs/wepy/issues/155)

## 1.5.6 (2017-05-22)
* `F` 修复了特殊情况下require路径编译出错的问题。[ISSUE 128](https://github.com/wepyjs/wepy/issues/128)
* `F` 修复了`wepy.createVideoContext`调用报错的问题。[ISSUE 133](https://github.com/wepyjs/wepy/issues/133)
* `F` 修复了`should not change the protected attribute __wxWebviewId__`的warning。[ISSUE 143](https://github.com/wepyjs/wepy/issues/143)
* `F` 修复了`output`参数不生效的问题。[ISSUE 145](https://github.com/wepyjs/wepy/issues/145)
* `A` 添加了对`npm`的`scope`的支持，如`import sth from '@scoped/sth';`

## 1.5.4 (2017-05-05)
* `A` 添加`:class`标签支持，如`:class="{className: mycondition > 1}"`。[ISSUE #99](https://github.com/wepyjs/wepy/issues/99)
* `F` 修复了在使用slot时，添加注释会导致编译报错的BUG。
* `F` 修复了属性值中使用`>`会导致属性编译出错的BUG。[ISSUE #118](https://github.com/wepyjs/wepy/issues/118)
* `F` 修复了在`onLoad`中使用`this.$redirect`报错的BUG。
* `F` 修复了外链样式时，import路径错乱的BUG。
* `F` 修复了空`<template>`节点编译报错的BUG。
* `F` 修复了`<template>`中只有两个`component`时，只会显示一个的BUG。[ISSUE #123](https://github.com/wepyjs/wepy/issues/123)

## 1.5.2 (2017-04-17)
* `A` style标签添加了scoped属性的支持。[ISSUE #79](https://github.com/wepyjs/wepy/issues/79)
* `F` 修改了项目外层有`src`目录会导致编译文件目录错乱的BUG。[ISSUE #91](https://github.com/wepyjs/wepy/issues/91)
* `A` 添加了redux支持，使用`wepy new demo --redux`生成带有redux示例的DEMO。[PR #93](https://github.com/wepyjs/wepy/pull/93)
* `F` 修复了手动删除dist目录时，不会自动生成`npm`文件的问题。



## 1.5.1 (2017-03-27) 
* `F` 修复了`onUnload`中直接赋值导致赋值失效的BUG。
* `A` 添加了`wepy-compiler-babel`的sourceMap支持。
* `A` 事件绑定优化，对于非原生事件，添加`.user`后缀也可识别。[PR #76](https://github.com/wepyjs/wepy/pull/76)
* `A` 添加`page.$preload`方法，扩展`onLoad`的第二个参数为`preloadData`。
* `A` 添加了`eslint`支持。[PR #80](https://github.com/wepyjs/wepy/pull/80)

**感谢@dolymood的贡献**


## 1.4.8 (2017-03-16)
* `F` 修复了在data中的数据存在undefined的情况下会出现异常的BUG。
* `F` 统一修复`$invoke`，`$broadcast`，`$emit`事件在执行完成时会出发`$apply`。
* `A` 添加了`@`符号来代替`bind`和`catch`。[ISSUE #71](https://github.com/wepyjs/wepy/issues/71)
* `A` 添加了组件自定义事件，如`@doSomething="someFunc"`。参考文档[组件自定义事件](https://github.com/wepyjs/wepy#组件自定义事件)。
* `F` 修复demo默认使用`@`符。


## 1.4.7 (2017-03-15)
* `F` 修复1.4.6版本中只一个`props`生效的BUG。[ISSUE #68](https://github.com/wepyjs/wepy/issues/68)
* `F` 修复了使用引用类型作为双向绑定不会触发父组件脏检查的BUG。
* `F` 修复了在`template`的`root`元素为自定义组件会导致编译报错的BUG。[ISSUE #67](https://github.com/wepyjs/wepy/issues/67)


## 1.4.6 (2017-03-14)
* `F` 移除了编译过程中自动生成的`xmlns:wx`属性。
* `F` 修改自带demo并发10个请求报错的BUG。
* `F` 修复了项目在没有安装NPM资源，时使用wepy报错的BUG。
* `A` 添加了repeat标签，代替`<block wx:for></block>`。
* `F` 修复了在`wx:for`中使用自定义组件时，使用props无法取值的BUG。
* `A` 在默认demo中添加了repeat示例。
* `F` 修复了使用pug出错时的错误提示。

## 1.4.5 (2017-03-07)
* `F` 修复了组件未定义`methods`时，使用`$invoke`报错的BUG。
* `F` 使用空template报错的BUG。
* `A` 添加了`computed`属性。
* `A` 添加了`onRoute`事件。
* `A` `wepy-cli`添加了`--empty`选项，`wepy new demo --empty`用于生成空项目。


## 1.4.4 (2017-02-28)
* `F` 修复`$invoke`事件`event`参数错误的BUG。[PR #50](https://github.com/wepyjs/wepy/issues/50)
* `F` 修复`onShareAppMessage`报错的问题。[PR #52](https://github.com/wepyjs/wepy/issues/52)
* `F` 修复了在没有申明`data`时使用`props`报错的BUG。[PR #54](https://github.com/wepyjs/wepy/issues/54)

## 1.4.3 (2017-02-22)
* `F` 修复调用原生api参数报错的BUG。
* `A` 添加wepy-plugin-replace插件。
* `F` 修复了Mixin事件中，event丢失的BUG。[PR #40](https://github.com/wepyjs/wepy/pull/40)
* `F` 修复了IOS 1.10.2 中Promise.resolve没被调用的BUG。
* `F` 修复了Mixin的自定义事件无效的BUG。[ISSUE #44](https://github.com/wepyjs/wepy/issues/44)
* `F` 修复了SASS和SCSS编译混乱的BUG。[ISSUE #43](https://github.com/wepyjs/wepy/issues/43)
* `A` 解决了不支持`moment.js`的问题。[ISSUE #45](https://github.com/wepyjs/wepy/issues/45)
* `F` 优化了wepy使用async/await的方式，不再依赖`babel-polyfill`。
* `F` 生成DEMO默认使用`async/await`。
* `A` 组件支持`'hidden', 'wx:if', 'wx:elif', 'wx:else'`四个属性。[PR #47](https://github.com/wepyjs/wepy/pull/47)

**感谢@shenqihui的贡献**

## 1.4.2 (2017-02-09)
* 添加slot支持，参看[slot说明](https://github.com/wepyjs/wepy#组件内容分发slot)。
* 更新最新template支持slot。

## 1.4.1 (2017-01-26)
* 修复了`onShareAppMessage`在所有页面都生效的问题。
* 修改了`bind/catch`事件的传参机制，支持传入非String类型参数。
* 修改了页面响应事件和组件通讯事件的参数顺序，改为默认最后一个参数为$event。
* 不再会重写wx原有API，例如使用wepy.request代替wx.request。
* 添加了两个API：app.use()，app.intercept()，参看[拦截器说明](https://github.com/wepyjs/wepy#拦截器)。
* 不再默认添加Promise polyfill支持，需要手动import，然后使用`app.use('promisify')`。
* 不再默认处理request并发问题，需要手动调用`app.use('requestfix')`。
* 不再默认支持async/await，需要手动引入`babel-polyfill`。
* 将默认npm目录压缩后的大小由170kb减少至23kb。

**以上改动将不向下兼容，升级前请查看[迁移指南](https://github.com/wepyjs/wepy/wiki/%E5%8D%87%E7%BA%A7%E6%8C%87%E5%8D%97#13x---141)**


## 1.3.11 (2017-01-16)
* 页面和组件均添加`$wxapp`和`$wxpage`属性
* 添加了`wepy-plugin-filemin`，可以压缩`wxml`和`json`文件。
* 修复了`onShareAppMessage` API 不生效的问题。
* 修复了组件template使用pug时不会编译的问题。
* 加入了node版本检测功能，低于Node版本低于5时提示更新Node版本。

## 1.3.10 (2017-01-10)
* 修复了less文件中使用import找不到路径的BUG。
* 修复了prop默认值混乱的BUG。
* 修复了prop默认值不会触发coerce的BUG。
* 优化编译过程中的一个报错提示。

## 1.3.9 (2017-01-05)
* 修复了wx.createCanvasContext在prmoise下报错的问题。
* 添加了`.wepyignore`忽略编译一些非必要文件。[ISSUE 12](https://github.com/wepyjs/wepy/issues/12)。
* 添加了typescript支持，wepy-compile-typescript。
* 添加了stylus支持，wepy-compile-stylus。

## 1.3.8 (2016-12-30)
* 修改组件原属性`name`，`prefix`为`$name`，`$prefix`。防止命名冲突的问题，参见[Issue](https://github.com/wepyjs/wepy/issues/8)。
* 修复了编译过程中的日志错误的问题。
* 简化语法，可以使用`:myprop`代替`v-bind:myprop`。
* 使用props时，添加了`once`和`sync`关键字，`:myprop.once="data"`：当父组件data改变时，不会修改子组件的myprop的值，除非将`once`改为`sync`关键字。默认为`once`
* 子组件申明props时，添加了`twoWay`选项，为false时，子组件数据变更不影响父组件。为true时，同步到父组件。
* 1.3.6版本后props默认父子互相不影响，除非加上`sync`和`twoWay`的属性。
* 编译时加入了版本检测，cli如果检测到wepy不符合版本要求会自动更新wepy版本。

## 1.3.5 (2016-12-23)
* 修复了升级1.3.3导致旧项目报`id is not defined`的错误。
* 发布过程中加入了LF强制转换逻辑，确保MAC在更新后不会出现`env: node\r: No such file or directory`的错误。
* 修复了用`<component>`时，导致样式丢失的问题。
* 修复了用`<component>`时，props不工作的问题。
* 更新了`wepy-wechat-demo`使用自定义component与props，并添加toast组件。

## 1.3.3 (2016-12-22)
* 修复了config使用单引号导致解析出错的问题。感谢[@Lxxyx]()
* 支持自定义组件标签，`<component id="mycom" path="mycom"></component>` 优化为 `<mycom></mycom>`。
* 新增props传值功能，支持静态传值如 `num="50"` 或者绑定传值如 `v-bind:num="parentnum"`，使用方式基于与[Vue Props传值](https://vuejs.org.cn/guide/components.html#Props)一致。
* 修复了组件支持事件传参，但页面不支持的问题。


## 1.3.2 (2016-12-19)
* 修复wx:else, scroll-x等boolean属性报warning的[问题](https://github.com/wepyjs/wepy/issues/5)。
* 修复了组件method不存在时，mixin的method不会被注册的BUG。感谢[@huike1989]()。
* 修复了引用第三方组件路径报错的BUG。感谢[@huike1989]()。

## 1.3.1 (2016-12-16)
* 新增对第三方Compiler的支持。
* 新增pug编译器。
* 重新整理代码结构，使用lerna维护不同的NPM包。
* 重新处理Plugins，同样交由第三方包处理。
* 添加了编译时检测依赖的Compiler或者Plugins是否缺失的逻辑，如果缺失会自行安装。
* 添加了cli工具版本检测的功能。

*老版本在升级1.3.1版本时，要修改`wepy.config.js`并且添加compilers属性，并且安装对应的编译器方可使用。[参考这里](https://github.com/wepyjs/wepy#wepyconfigjs-配置文件说明)*


## 1.1.9 (2016-12-14)
* 新增了wepy upgrade命令升级wepyjs版本。
* 新增对第三方组件的支持。
* 新增第三方组件[wepy-com-toast](https://github.com/wepyjs/wepy-com-toast)。
* 模板中添加toast组件测试。


## 1.1.8 (2016-12-08)
* 修复了script使用src外链报错的BUG。
* 修复了LESS编译会调用到SASS的BUG。
* 优化了事件传参数，支持直接传参。详情[参考文档](https://github.com/wepyjs/wepy#2-优化事件参数传递)。
* 加入了Travis-CI以及Coveralls。
* 修复其它细节BUG问题

## 1.1.7 (2016-12-06)
* script/template/style的属性同时支持type和lang。
* 添加mixins支持，详情请[参考文档](https://github.com/wepyjs/wepy#混合)。

## 1.1.6 (2016-12-02)
* 修复了组件ID大写导致无法识别的问题。
* 添加了对小程序页面所有响应事件的支持。
* 修改wepy.config.js支持plugins。
* 添加UglifyJsPlugin，在编译时对生成的所有JS文件进行压缩。
* 添加ImageMinPlugin(不推荐使用，处理大图片时还有问题)，
* 添加`wepy build --no-cache`参数，编译时会重新编译所有依赖文件。
* `wepy new demo`时，由在当前目录下生成项目改为创建demo目录，然后再生成项目。
* 更新生成demo支持最新功能。

## 1.1.4 (2016-12-01)

* 添加了小程序其它页面事件的支持
* 修改默认配置文件.wepyrc为wepy.config.js，方便以后功能扩展。（兼容老配置文件）

## 1.1.3 (2016-11-28)

* 修复SASS编译异常导致watch结束的BUG
* 修复子组件修改时不会触发父组件更新的BUG
* 修复`$invoke('../')`的BUG
* 修复页面onLoad事件中传参的BUG

## 1.1.1 (2016-11-23)

* 添加了对sass/scss的编译支持
* .wepyrc中加入对less/sass的配置支持
* .wepyrc中添加`wpyExt`选项
* 更新生成模板
