# wepy 和 redux 结合的连接器

## 安装

```
npm install wepy-redux --save
```

## 示例

```vue
<template>
  <view class="container">
    <text class="info">{{num}}</text>
    <text class="info">{{inc}}</text>
    <button @tap="addNum" size="mini">  + num  </button>
    <button @tap="asyncInc" size="mini">  async inc </button>
  </view>
</template>

<script>
  import wepy from 'wepy'
  import { connect } from 'wepy-redux'
  import List from '../components/list'
  import Panel from '../components/panel'
  import Counter from '../components/counter'
  import Group from '../components/group'
  import Toast from 'wepy-com-toast'
  import { INCREMENT } from '../store/types/counter'
  import { asyncInc } from '../store/actions'
  import testMixin from '../mixins/test'

  @connect({
    num(state) {
      return state.counter.num
    },
    inc: 'inc'
  }, {
    addNum: INCREMENT,
    asyncInc
  })
  export default class Index extends wepy.page {
  	// ...
    methods = {
      // ...
    }
    // ...
    onLoad() {
    }
  }
</script>
```

## 使用

1. 初始化 store

```js
// app.wpy
import { createStore } from 'redux'
import { setStore } from 'wepy-redux'
import rootReducer from './reducers'

const store = createStore(rootReducer)
// set!!
setStore(store)
```

2. 得到 store

```js
import { getStore } from 'wepy-redux'

const store = getStore()
// 可以直接使用 store 实例了
// dispatch
store.dispatch({type: 'xx'})
// state
const state = store.getState()
```

3. 连接组件，就以上边的示例来说明

```js
// ...
  import { connect } from 'wepy-redux'
  @connect({
    num(state) {
      return state.counter.num
    },
    inc: 'inc'
  }, {
    addNum: INCREMENT,
    asyncInc
  })
  export default class Index extends wepy.page {
  	// ...
    methods = {
      // ...
    }
    // ...
    onLoad() {
    }
  }
```

这里主要涉及到 `connect` 的用法： `connect(states, actions)`，这里解释下：

* `states`: 访问 state 上的值，可以是数组或者对象，如果是对象的话，则包含的是 `K-V` 对，`V` 可以是函数还可以是字符串，如果是字符串的话则默认获取 `state[V]`， 否则的话则是使用返回值；而对于如果是数组的话（数组中的项只能为字符串），则认为是相同的 `K-V` 对象结构。`states` 最终会附加到组件的 `computed` 属性值上。

* `actions`: 只能传入对象，对象的 `K-V` 结构，如果 `V` 是字符串的话，则直接会 `distatch` 如下的结构：

	```js
	// args 就是调用传入参数
	{
		type: val,
		// 修正一般情况下的参数 一般支持只传一个参数
		// 如果真的是多个参数的话 那么 payload 就是参数组成的数组
		payload: args.length > 1 ? args : args[0]
	}
	```
	如果是一个函数 fn，则会 `dispatch(val.apply(store, args))`，否则的话则直接 `dispatch(V)`


