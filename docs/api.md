## API

### wepy.app Class

App 基类，小程序入口。

```javascript
export class App extends wepy.app {
    onLaunch () {

    }
}
```

 **属性**

* `$wxapp:Object`: `this.$wxapp`等同于`getApp()`。

* `$pages:List<Page>`: 所有页面列表
格式如下：

```javascript
this.$pages = {
    './pages/index': IndexPage
}
```

* `$interceptors:List<Object>`：所有拦截器列表
格式如下：

```javascript
this.$interceptors = {
    'request': {
        config (p) {
            return p;
        },
        success (rst) {

        }
    }
}
```

 **方法**

* `use(middleWare:String|Function)`：使用中间件。
当前内置两个中间件：
`requestfix`: 修复小程序请求并发问题。
`promisify`：使用`wepy.xxx`的方式请求小程序原生API都将Promise化。
使用方法如下:

```javascript
this.use('requestfix');
this.use('promisify');
```

* `intercept(api:String, provider:Object)`：使用拦截器对原生API请求进行拦截。

```javascript
// app.js
constructor () {
    super();
    this.intercept('request', {
        config (p) {
            p.timestamp = +new Date();
        },
        success (obj) {
            console.log('request success');
        }
    });
}
```

### wepy.component Class

组件基类

 **属性**

* `$name:String`: 组件名称。
* `$isComponent:Boolean`：是否是组件，如果是页面，此值为false。
* `$wxpage:Object`: 小程序原生page。
* `$parent:Page|App`：组件的父组件，如果当前是组件是Page对象，那么$parent的值为App对象。
* `$root:Page`: 组件所在的Page对象，如果当前组件是Page对象，那么$root的值就是自己本身。
* `$coms:List<Component>`：组件的子组件列表。
* `$mixins:Array[Mixin]`：组件所注入的Mixin对象。
* `data:Object`: 组件需要绑定的数据。
* `methods:List<Function>`：组件需要响应的事件列表。
* `props:List<Props>`：组件允许传递的props列表。
* `events:List<Function>`：组件通信时所需要的事件表现。

 **方法**

* `setData(key:String|Object, [value:Object])`：对原有小程序的`setData`的封装。
因为WePY的脏查检流程会自动执行setData操作，所以通常情况下不需要使用此方法。

```javascript
this.setData('list', ['apple', 'pen']);
this.setData({
    list: ['apple', 'pen']
});
```

* `getCurrentPages()`：相当于全局方法`getCurrentPages()`。
* `$getComponent(com:String)`：通过组件名称路径查找组件对象。

```javascript
this.$getComponent('./coma/comb');
this.$getComponent('../comc');
```

* `$invoke(com:String|Component)`：调用另一组件的方法。
优先调用methods中方法，如果方法不存在，则调用组件的自定义方法，调用自定义方法时，不会传递事件$event。

```javascript
// coma.js
this.$invoke('./ComB', 'func1', 'p1', 'p2');
this.$invoke('./ComB', 'func2', 'p1', 'p2');

// comb.js
export class ComB extends wepy.component {
    methods = {
        func1 (p1, p2, evt) {}
    },
    func2 (p1, p2) {}
}
```

* `$broadcast(eventName:String, [args])`：组件发起一个广播事件。
向所有子组件发起一个广播事件，事件会依次传播直至所有子组件遍历完毕或者事件被手动终止传播。

```javascript
// page1.js
components = { ComA };
this.$broadcast('broadcast-event', 'p1', 'p2');

// coma.js
events = {
    'broadcast-event': (p1, p2, event) {}
}
```

* `$emit(eventName:String, [args])`：组件发起一个冒泡事件。
向父组件发起一个冒泡事件，事件会向上冒泡直至Page或者者事件被手动终止传播。

```javascript
// coma.js
this.$emit('emit-event', 'p1', 'p2');

// page1.js
components = { ComA };
events = {
    'emit-event': (p1, p2, event) => {}
}
```

* `$apply([func:Function])`：组件发起脏检查。
正常流程下，改变数据后，组件会在流程结束时自动触发脏检查。
在异步或者回调流程中改变数据时，需要手动调用`$apply`方法。

```javascript
this.userName = 'Gcaufy';
this.$apply();

this.$apply(() => {
    this.userName = 'Gcaufy';
});
```

### wepy.page Class

页面类，继承自`wepy.component`，拥有页面所有的属性与方法。

 **属性**

全部属性继承自`wepy.component`。

 **方法**

* `$preload(key:String|Object, [value:Object])`：给页面加载preload数据
加载preload数据后，跳转至另一个页面时，在onLoad方法中可以获取到上个页面的preload数据。

```javascript
// page1.js
this.$preload('userName': 'Gcaufy');
this.$redirect('./page2');

// page2.js
onLoad (params, data) {
    console.log(data.preload.userName);
}
```

* `$redirect(url:String|Object, [params:Object])`：`wx.redirectTo`的封装方法。

```javascript
this.$redirect('./page2', {a: 1, b: 2});
this.$redirect({
    url: './pages?a=1&b=2'
});
```

* `$navigate(url:String|Object, [params:Object])`：`wx.navigateTo`的封装方法
* `$switch(url:String|Object)`：`wx.switchTab`的封装方法




### wepy.event Class

小程序事件封装类

```javascript
new wepy.event(name:String, source:Component, type:String)
```

 **属性**

* `name(String)`: 事件名称
当事件为小程序原生事件时，如`tap`，`change`等，name值为`system`。
当事件为用户自定事件或者组件通信事件时，如`$emit`，`$broadcast`等，name值为自定事件的名称。

* `source(Component)`：事件来源组件
无论是小程序原生事件还是自定事件，都会有对应的事件来源组件。

* `type(String)`: 事件类型
`$emit`事件中，type值为`emit`。`bindtap`事件中，type值为`tap`。


 **方法**

* `$destroy()`：终止事件传播
在`$emit`或者`$broadcast`事件中，调用`$destroy`事件终止事件的传播。

* `$transfor(wxevent:Object)`：将内部小程序事件的属性传递到当前事件。

### wepy.mixin Class

Mixin基类，用于复用不同组件中的相同功能。

```javascript
// mymixn.js
export class MyMixin extends wepy.mixin {
    // my logic here
}

// mycom.js
import MyMixin from './mymixin';
export class MyCom extends wepy.component {
    mixins = [MyMixin];
}
```

