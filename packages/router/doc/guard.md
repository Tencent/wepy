## 导航守卫

导航守卫参考 vue-router 的导航守卫，基本保持接口对齐。但有以下区别：

- 支持 promise，可让函数返回一个 promise 代替 next。
- to、from 的具体内容不同
- 解析流程有部分区别

### beforeRouteLeave

- 组件守卫，离开页面时触发

- **形式**：beforeRouteLeave(to, from, next)

- **参数**：

  - `{Object} to` 目标路由
    - name 页面名
    - query 跳转页面携带数据
    - meta 携带额外信息
    - jumpMethodName 跳转方式: 'navigateBack', 'navigateTo', 'redirectTo', 'reLaunch', 'switchTab'
    - encode: 是否编码
  - `{Object} from` 原路由
    - name 页面名
    - query 跳转页面携带数据
    - meta 携带额外信息
  - `{function} next`
    - **`next()`**: 进入下一个守卫
    - **`next(false)`**: 中断当前的导航
    - **`next({ name, query, meta, jumpMethodName, encode })`**: 跳转到一个不同的页面。当前导航被中断
    - **`next(error)`**: 如果传入 `next` 的参数是一个 `Error` 实例，则导航会被终止且该错误会被传递给 `router.onError()` 注册过的回调

- **this**：指向离开页面的实例

- **返回值**：promise，无论 rejected 还是 fulfilled ，其值的处理逻辑相同

  - **`true`**: 进入下一个守卫
  - **`false`**: 中断当前的导航
  - **`{ name, query, meta, jumpMethodName, encode }`**: 跳转到一个不同的页面。当前导航被中断
  - **`error`**: 返回一个 `Error` 实例，则导航会被终止且该错误会被传递给 `router.onError()` 注册过的回调

  > `注意`：next 和 返回值 二选一，不然跳转会卡主

- **用法**

  在页面里定义

- **示例**

  ```js
  <script>
    wepy.page({
      beforeRouteLeave(to, from, next) {
        next()
      }
      // 或者
      async beforeRouteLeave(to, from) {
        return true
      }
    })
  </script>
  ```

### beforeEach

- 全局守卫，离开页面时触发

- **形式**：beforeEach(to, from, next)

- **参数**：

  - `{Object} to` 目标路由
    - name 页面名
    - query 跳转页面携带数据
    - meta 携带额外信息
    - jumpMethodName 跳转方式: 'navigateBack', 'navigateTo', 'redirectTo', 'reLaunch', 'switchTab'
    - encode: 是否编码
  - `{Object} from` 原路由
    - name 页面名
    - query 跳转页面携带数据
    - meta 携带额外信息
  - `{function} next`
    - **`next()`**: 进入下一个守卫
    - **`next(false)`**: 中断当前的导航
    - **`next({ name, query, meta, jumpMethodName, encode })`**: 跳转到一个不同的页面。当前导航被中断
    - **`next(error)`**: 如果传入 `next` 的参数是一个 `Error` 实例，则导航会被终止且该错误会被传递给 `router.onError()` 注册过的回调

- **this**：指向离开页面的实例

- **返回值**：

  - promise，无论 rejected 还是 fulfilled ，其值的处理逻辑相同

    - **`true`**: 进入下一个守卫
    - **`false`**: 中断当前的导航
    - **`{ name, query, meta, jumpMethodName, encode }`**: 跳转到一个不同的页面。当前导航被中断
    - **`error`**: 返回一个 `Error` 实例，则导航会被终止且该错误会被传递给 `router.onError()` 注册过的回调

    > `注意`：next 和 返回值 二选一，不然跳转会卡主

- **用法**

  全局定义

- **示例**

  ```js
  <script>
  import router from 'router'
  router.beforeEach(function beforeEach(to, from, next) {
    next()
  })
  // 或者
  router.beforeEach(function beforeEach(to, from) {
    return true
  })
  </script>
  ```

### beforeEnter

- 路由守卫

- **形式**：beforeEnter(to, from, next)

- **参数**：

  - `{Object} to` 目标路由
    - name 页面名
    - query 跳转页面携带数据
    - meta 携带额外信息
    - jumpMethodName 跳转方式: 'navigateBack', 'navigateTo', 'redirectTo', 'reLaunch', 'switchTab'
    - encode: 是否编码
  - `{Object} from` 原路由
    - name 页面名
    - query 跳转页面携带数据
    - meta 携带额外信息
  - `{function} next`
    - **`next()`**: 进入下一个守卫
    - **`next(false)`**: 中断当前的导航
    - **`next({ name, query, meta, jumpMethodName, encode })`**: 跳转到一个不同的页面。当前导航被中断
    - **`next(error)`**: 如果传入 `next` 的参数是一个 `Error` 实例，则导航会被终止且该错误会被传递给 `router.onError()` 注册过的回调

- **this**：指向离开页面的实例

- **返回值**：

  - promise，无论 rejected 还是 fulfilled ，其值的处理逻辑相同

    - **`true`**: 进入下一个守卫
    - **`false`**: 中断当前的导航
    - **`{ name, query, meta, jumpMethodName, encode }`**: 跳转到一个不同的页面。当前导航被中断
    - **`error`**: 返回一个 `Error` 实例，则导航会被终止且该错误会被传递给 `router.onError()` 注册过的回调

    > `注意`：next 和 返回值 二选一，不然跳转会卡主

- **用法**

  routerConfig 里配置

- **示例**

  ```js
  routerConfig = {
    PersonalDetail: {
      path: '/pagesSubPackage/personal/pages/PersonalDetail',
      beforeEnter: (to, from, next) => next()
    }
  }
  ```

### beforeRouteEnter

- 组件守卫，进入页面时触发

- **形式**：beforeRouteEnter(to, from, next)

- **参数**：

  - `{Object} to` 目标路由
    - name 页面名
    - query 跳转页面携带数据
    - meta 携带额外信息
    - jumpMethodName 跳转方式: 'navigateBack', 'navigateTo', 'redirectTo', 'reLaunch', 'switchTab'
    - encode: 是否编码
  - `{Object} from` 原路由
    - name 页面名
    - query 跳转页面携带数据
    - meta 携带额外信息
  - `{function} next`
    - **`next()`**: 进入下一个守卫
    - **`next(false)`**: 中断当前的导航
    - **`next({ name, query, meta, jumpMethodName, encode })`**: 跳转到一个不同的页面。当前导航被中断
    - **`next(error)`**: 如果传入 `next` 的参数是一个 `Error` 实例，则导航会被终止且该错误会被传递给 `router.onError()` 注册过的回调
    - **`next(vm => {})`**：vm 为进入页面的实例

- **this**：由于进入页面还未实例化，因此不能使用，由 vm 代替

- **返回值**：

  - promise，无论 rejected 还是 fulfilled ，其值的处理逻辑相同

    - **`true`**: 进入下一个守卫
    - **`false`**: 中断当前的导航
    - **`{ name, query, meta, jumpMethodName, encode }`**: 跳转到一个不同的页面。当前导航被中断
    - **`error`**: 返回一个 `Error` 实例，则导航会被终止且该错误会被传递给 `router.onError()` 注册过的回调
    - **`vm => {}`**： vm 为进入页面的实例

    > `注意`：next 和 返回值 二选一，不然跳转会卡主

- **用法**

  页面里定义

- **示例**

  ```js
  <script>
    wepy.page({
      beforeRouteEnter(to, from, next) {
        next(false)
      }
      // 或者
      async beforeRouteEnter(to, from) {
        return vm => {}
      }
    })
  </script>
  ```

### beforeResolve

- 全局守卫，以上守卫执行后执行，但在页面跳转前

- **形式**：beforeResolve(to, from, next)

- **参数**：

  - `{Object} to` 目标路由
    - name 页面名
    - query 跳转页面携带数据
    - meta 携带额外信息
    - jumpMethodName 跳转方式: 'navigateBack', 'navigateTo', 'redirectTo', 'reLaunch', 'switchTab'
    - encode: 是否编码
  - `{Object} from` 原路由
    - name 页面名
    - query 跳转页面携带数据
    - meta 携带额外信息
  - `{function} next`
    - **`next()`**: 进入下一个守卫
    - **`next(false)`**: 中断当前的导航
    - **`next({ name, query, meta, jumpMethodName, encode })`**: 跳转到一个不同的页面。当前导航被中断
    - **`next(error)`**: 如果传入 `next` 的参数是一个 `Error` 实例，则导航会被终止且该错误会被传递给 `router.onError()` 注册过的回调

- **this**：无 this

- **返回值**：

  - promise，无论 rejected 还是 fulfilled ，其值的处理逻辑相同

    - **`true`**: 进入下一个守卫
    - **`false`**: 中断当前的导航
    - **`{ name, query, meta, jumpMethodName, encode }`**: 跳转到一个不同的页面。当前导航被中断
    - **`error`**: 返回一个 `Error` 实例，则导航会被终止且该错误会被传递给 `router.onError()` 注册过的回调

    > `注意`：next 和 返回值 二选一，不然跳转会卡主

- **用法**

  全局定义

- **示例**

  ```js
  <script>
  import router from 'router'
  router.beforeResolve((to, from, next) => next())
  // 或者
  router.beforeResolve((to, from) => true)
  </script>
  ```

### afterEach

- 全局守卫，进入页面后触发

- **形式**：afterEach(to, from)

- **参数**：

  - `{Object} to` 目标路由
    - name 页面名
    - query 跳转页面携带数据
    - meta 携带额外信息
  - `{Object} from` 原路由
    - name 页面名
    - query 跳转页面携带数据
    - meta 携带额外信息

- **this**：指向进入页面的实例

- **返回值**：

  - 无

- **用法**

  全局定义

- **示例**

  ```js
  <script>
  import router from 'router'
  router.afterEach((to, from) => {})
  </script>
  ```

### beforeRouteUpdate

- 组件守卫，页面内跳转

- **形式**：beforeRouteUpdate(to, from, next)

- **参数**：

  - `{Object} to` 目标路由
    - query 跳转页面携带数据
    - meta 携带额外信息
  - `{Object} from` 原路由
    - query 跳转页面携带数据
    - meta 携带额外信息
  - `{function} next`
    - **`next()`**: 进入下一个守卫
    - **`next(false)`**: 中断当前的导航
    - **`next({ name, query, meta, jumpMethodName, encode })`**: 跳转到一个不同的页面。当前导航被中断
    - **`next(error)`**: 如果传入 `next` 的参数是一个 `Error` 实例，则导航会被终止且该错误会被传递给 `router.onError()` 注册过的回调

- **this**：当前页面的实例

- **返回值**：promise，无论 rejected 还是 fulfilled ，其值的处理逻辑相同

  - **`true`**: 进入下一个守卫
  - **`false`**: 中断当前的导航
  - **`{ name, query, meta, jumpMethodName, encode }`**: 跳转到一个不同的页面。当前导航被中断
  - **`error`**: 返回一个 `Error` 实例，则导航会被终止且该错误会被传递给 `router.onError()` 注册过的回调

  > `注意`：next 和 返回值 二选一，不然跳转会卡主
  >
  > **跳转成功以后，route 对象会更新**

- **用法**

  在页面里定义（当跳转页面为当前页面时，触发此导航）

- **示例**

  ```js
  <script>
    wepy.page({
      beforeRouteUpdate(to, from, next) {
        next()
      }
      // 或者
      async beforeRouteLeave(to, from) {
        return true
      }
    })
  </script>
  ```

### 完整页面导航解析流程

#### 不同页面

1. 从一个页面跳转到另一页面
2. 在离开页面里调用 `beforeRouteLeave`
3. 调用全局的 `beforeEach` 
4. 调用路由配置里的 `beforeEnter`
5. 调用即将进入页面的 `beforeRouteEnter`
6. 调用全局的 `beforeResolve` 
7. 页面进入后
8. 调用全局的 `afterEach` 
9. 调用 `beforeRouteEnter` 中传给 `next` 的回调函数（如果定义了）
10. 如果某个守卫改变了页面跳转，则中断以上流程并且重新开始导航解析

#### 同一个页面

1. 从一个页面跳转到另一页面
2. 离开页和进入页为同一个页面
3. 调用当前页的`beforeRouteUpdate`
