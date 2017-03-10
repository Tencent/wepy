

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


| 方法 | 参数 | 返回值 | 说明|
| ---- | ---- | ---- | ---- |
| init | - | - | 应用始化包括对原生API的改造与优化|
| intercept | api(String), provider(Function) | - | API拦截器 |
