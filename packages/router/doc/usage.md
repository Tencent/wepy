## Features

对微信路由进行了封装和扩展（设计思路主要参考 vue router）

- 结构化路由配置
- api 支持 promise
- 任意类型的路由传参
- 导航守卫

## Usage

### 创建一个路由管理器

```js
const homePage = 'SplashScreen'
const tabPages = ['CourseList']
const routeMap = {
  SplashScreen: '/pages/SplashScreen',
  CourseList: '/pages/tabBar/courseList/CourseList',
  CourseDetail: '/pages/CourseDetail','
  CourseOnlineDetail: { name: 'CourseDetail', query: { courseType: 'online' } },
}
const config = { homePage, tabPages, routeMap }

const router = createSmRouter(config)
wepy.use(routerPlugin, router);

export { router }
```

### 使用场景

具体使用场景可以根据业务自行处理，下面给出几个典型场景供开发者参考

#### 页面跳转

```js
// 其它页
const course = { id: '123', text: '课程' };
router.navigateTo({ name: 'CourseDetail', query: { course } })


// CourseDetail 页
wepy.page({
  name: 'CourseDetail',
  onLoad() {
    // params = { course: { id: '123', text: '课程' } }
    const params = this.$route.query;
  }
})
```

#### 别名跳转

```js
// 其它页
const course = { id: '233', text: '线上课程' };
router.navigateTo({ name: 'CourseOnlineDetail', query: { course } })

// CourseDetail 页
wepy.page({
  name: 'CourseDetail',
  onLoad() {
    // params = { course: { id: '233', text: '线上课程' }, courseType: 'online' }
    const params = this.$route.query;
  }
})
```

#### 预加载数据

- 提升页面加载速度，减少用户等待时间，这时可以使用守卫 `beforeRouteEnter`处理

  ```js
  <script>
    wepy.page({
      name: 'xxx',
      _pData: null,
      beforeRouteEnter(to, from, next) {
        const pData = api.getXXX()
        next(vm => {
          vm.$options._pData = pData
        })
      },
      onLoad() {
        this._fetchData()
      },
      methods: { 
        async _fetchData() {
          try {
            if (this.$options._pData) {
              this._renderingData = await this.$options._pData
            } else {
              this._renderingData = await api.getXXX()
            }
          } catch(e) {
            // 错误处理
          } finally {
            this.$options._pData = null
          }
        }
       }
    })
  </script>
  ```

#### 复杂情况下的页面数据交互

- 将获取数据抽象成一个服务

  ```js
  // 代金券选择组件
  wepy.component({
    /** 页面/组件名 */
    name: 'BookingConfirmRowSelectTicket',
    methods: {
      async goSelectTicket() {
        this.ticketId = await this._getTicketId() || ''
      },
  
      _getTicketId() {
        return new Promise((resolve, reject) => {
          this.$router.navigateTo({
            name: 'UseTicket',
            query: {
              ...params,
              resolve,
              reject
            }
          })
        })
      }
    },
  })
  
  // 选择代金券页面
  wepy.page({
    /** 页面/组件名 */
    name: 'UseTicket',
    methods: {
      onSelectTicket({ ticketId }) {
        this.ticketId = ticketId
        this.$router.navigateBack({ delta: 1 })
      }
    },
    onUnload() {
      this.$route.query.resolve(this.ticketId)
    }
  })
  ```

#### 非正常流程页面跳转

- 要求符合条件 A 的用户无论点击哪个按钮都要跳到某个指定页面，这时可以使用守卫 `beforeRouteLeave`处理

  ```js
  <script>
    wepy.page({
      name: 'xxx',
      beforeRouteLeave(to, from, next) {
        // 如果不加 to.name !== 'xxxPage'，会进入死循环
      	if (this.condition && to.name !== 'xxxPage') {
      	  next({ name: 'xxxPage', jumpMethodName: 'navigateTo' })
      	} else {
      	  next()
      	}
      }
    })
  </script>
  ```

#### 限制进入某个页面

- 进入某个页面需要符合某个条件，这时可以使用守卫 `beforeEnter`处理

  ```js
  routerConfig = {
    xxxPage: {
      path: '/xxxPath',
      beforeEnter: (to, from, next) => {
        if (condition) {
          next()
        } else {
          this.$showToast('需要 xxx 条件方可进入哦')
          next(false)
        }
      }
    }
  }
  ```

#### 页面内不同标签页之间跳转

- 某个页面由不同业务组成，分成不同标签页，在定义路由时可根据标签页定义不同的逻辑页面（映射到同一个物理页面），页面内跳转时，可以使用`beforeRouteUpdate`守卫处理。（可以参考启动页、课表页）

  ```js
  routeMap = {
    xxxPage: '/xxxPath',
    APage: { name: 'xxxPage', query: { type: 'A' } },
    BPage: { name: 'xxxPage', query: { type: 'B' } }
  }
  
  <script>
    wepy.page({
      name: 'xxxPage',
      data: {
        type: 'A'
      },
      beforeRouteUpdate(to, from, next) {
        if (to.query.type === 'B') {
          // 处理 B 业务
        }
  
        next()
      }
    })
  </script>
  ```

## 注意事项

- 路由管理器基于微信提供的 api，但如果用户某个路由跳转行为不是基于 api，那么守卫将无法处理，开发时需要注意。例如：手势滑动返回 或者 点击 tab 或者从外部跳转进入小程序
- 对于首次分包加载， `beforeRouteEnter`守卫无法终止路由跳转，因为导航守卫是在运行时处理的，首次分包加载前无跳转页面代码，因此拿不到此守卫

## 文档

* [配置](config.md)
* [导航守卫](guard.md)
* API
    * [router](router.md)
    * [实例](instance.md)
