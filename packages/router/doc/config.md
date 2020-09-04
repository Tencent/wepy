## 路由配置

routeMap 是一个对象（key / value），所有页面的路由都在此配置。其中 key 为页面名（name），value 为路由配置信息（config），例如：

> `页面名必须在页面里定义：wepy.page({ name: '页面名' })`

```js
homePage = 'SplashScreen'
tabPages = ['CourseList']
routeMap = {
  SplashScreen: '/pages/SplashScreen',
  CourseList: '/pages/tabBar/courseList/CourseList',
  ClassList: { name: 'CourseList', query: { courseType: 'class' } },
  BookList: { path: '/pages/BookList', query: { info: { name: 'roma' } }, meta: 2},
  CityList: { handler: ({ query }) => ({ path: '/pages/CityList', query }) },
  Courses: 'CourseList'
}
```

config 支持三种数据类型来配置一个路由：Object、function、string

### config（Object）

两种结构：

#### 第一种

| 字段名      | 类型     | 必填 | 说明                                                         |
| :---------- | -------- | ---- | ------------------------------------------------------------ |
| path        | string   | 否   | 页面绝对路径 |
| name        | string   | 否   | 页面名                                                       |
| query        | Object   | 否   | 路由传参参数                                                 |
| meta        | any      | 否   | 不属于 data 的额外信息                                       |
| beforeEnter | function | 否   | 查看导航守卫章节                                             |

> 注：`path、page 二选一，page 应该与页面文件名一致`

#### 第二种

| 字段名      | 类型     | 必填 | 说明                                                       |
| :---------- | -------- | ---- | ---------------------------------------------------------- |
| handler     | function | 是.  | ({ query }) => { path, name, query, meta }，具体含义参考上面 |
| beforeEnter | function | 否   | 查看导航守卫章节                                           |

### config（function）

```
({ query }) => ({ path | name, query(可选), meta(可选) } | string)
```

### config（string）

```
path 或者 name，有 / 的被认为是 path
```
