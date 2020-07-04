# WePY 2.0中的Vuex 

## 安装

```
npm install @wepy/x vuex --save
```

## 用法

1. 安装Vuex 

```
// app.wpy
import wepy from '@wepy/core';
import vuex from '@wepy/x';

wepy.use(vuex);
```

2. 初始化store

```
// ~/store.js
import Vuex from '@wepy/x';

export default new Vuex.Store({
  state: {
    num: 0
  },
  mutations: {
    increment (state) {
      state.num++;
    }
  },
  actions: {
    increment ({ commit }) {
      commit('increment');
    },
    incrementAsync ({ commit }) {
      setTimeout(() => commit('increment'), 1000);
    }
  }
})
```

3. 映射到组件

```
// ~/counter.wpy
<template>
  <div> {{num}} </div>
  <button @tap="increment"> Increment </button>
  <button @tap="incrementAsync"> Increment Async </button>
</template>
<script>
import wepy from '@wepy/core';
import { mapState, mapActions } from '@wepy/x';

wepy.component({
  computed: {
    ...mapState([ 'num' ])
  },
  methods: {
    ...mapActions([ 'increment', 'incrementAsync' ])
  }
})
```

## 文件

[https://vuex.vuejs.org/](https://vuex.vuejs.org/)

## 其他

目前不支持 [Vuex 模块](https://vuex.vuejs.org/guide/modules.html) 。  在此处检查 [问题](https://github.com/Tencent/wepy/issues/2191) 。