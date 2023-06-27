[English](./README_EN.md) | 简体中文
Simplified Chinese


# WePY 2.0中的Vuex 

## 安装
## Install

```
npm install @wepy/x vuex --save
```

## 用法
## Usage

1. Install Vuex

```
// app.wpy
import wepy from '@wepy/core';
import vuex from '@wepy/x';

wepy. use(vuex);
```

2. Initialize the store

```
// ~/store.js
import Vuex from '@wepy/x';

export default new Vuex. Store({
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

3. Mapping to components

```
// ~/counter.wpy
<template>
  <div>{{num}}</div>
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

## document

[https://vuex.vuejs.org/](https://vuex.vuejs.org/)

## other

[Vuex modules](https://vuex.vuejs.org/guide/modules.html) are currently not supported. Check the [issue](https://github.com/Tencent/wepy/issues/2191) here.