[English](./README.md) | 简体中文

# WePY 2.0中的Redux

## 安装

```
npm install @wepy/redux redux --save
```

## 用法

1. 安装Redux

```
// app.wpy
import wepy from '@wepy/core';
import wepyRedux from '@wepy/redux';

wepy.use(wepyRedux);
```

2. 初始化 Store

```
// ~/store.js
import { createStore, combineReducers } from 'redux';

export default createStore(combineReducers({
  counter (state = { num: 0 }, action) {
    switch (action.type) {
      case 'ADD':
        return {
          ...state,
          num: state.num + 1
        };
    }
    return state;
  }
}));
```

3. 映射到组件

```
// ~/counter.wpy
<template>
  <div> {{counter.num}} </div>
  <button @tap="increment"> Increment </button>
</template>
<script>
import wepy from '@wepy/core';
import { mapState } from '@wepy/redux';
import store from './store'

wepy.component({
  store,
  computed: {
    ...mapState([ 'counter' ])
  },
  methods: {
    increment () {
      this.$store.dispatch({ type: 'ADD' })
    }
  }
})
```

## API

* mapState(states) 

  状态：字符串/数组/K-V对象.。需要映射的 state 属性。如:

  ```
  mapState('counter')
  mapState(['counter', 'somethingelse'])
  mapState({ alias: 'counter' })
  mapState({ 
    num: function (state) {
      return state.counter.num;
    } 
  })
  ```

* mapActions(actions)

  actions: K-V Object. 需要映射的 action 。如：

  ```
  mapActions({ add: 'ADD' });
  mapActions({ 
    add: function () {
      return {
        type: 'ADD'
      };
    } 
  });
  ```

## Document 

[https://redux.jg.org](https://redux.js.org)