# Vuex in WePY 2.0 

## Install

```
npm install @wepy/x vuex --save
```

## Usage

1. Install Vuex 
```
// app.wpy
import wepy from '@wepy/core';
import vuex from '@wepy/x';

wepy.use(vuex);
```

2. Initialize a store
```
// ~/store.js
import Vuex from '@wepy/x';

export default new Vuex.store({
  state: {
    counter: 0
  },
  mutations: {
    increment (state) {
      state.counter.num++;
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

3. Map to Component
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

## Document 
[https://vuex.vuejs.org/](https://vuex.vuejs.org/)
