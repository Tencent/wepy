import {
  encodeParams,
  encodeUrl,
  decodeParams,
  decodePage,
  decodeUrl,
  guard,
  createComponentGuard,
  routeManager,
  config
} from './core'

let _isExternalJump = false
let _isCallAppShow = false
let _externalQuery = {}

export default {
  install(wepy, router) {
    wepy.config.optionMergeStrategies['__routerHandler'] = (_, option) => {
      const { name, beforeRouteLeave, beforeRouteEnter, beforeRouteUpdate } = option

      if (!(name in config.routeMap)) {
        return
      }

      if (!guard.hasInComponentGuardMap(name)) {
        guard.updateComponentGuardMap(createComponentGuard(name))
      }

      if (beforeRouteLeave) {
        guard.componentGuardMap[name].beforeRouteLeave(beforeRouteLeave)
      }

      if (beforeRouteEnter) {
        guard.componentGuardMap[name].beforeRouteEnter(beforeRouteEnter)
        handleBeforeRouteLeave(name, beforeRouteEnter)
      }

      if (beforeRouteUpdate) {
        guard.componentGuardMap[name].beforeRouteUpdate(beforeRouteUpdate)
      }

      async function handleBeforeRouteLeave(name, beforeRouteLeave) {
        if (routeManager.__tempRoute && name === routeManager.__tempRoute.name) {
          try {
            const res = await beforeRouteLeave(routeManager.__tempRoute, routeManager.route, res => {
              if (typeof res === 'function') {
                routeManager.setNext(res)
              }
            })

            if (typeof res === 'function') {
              routeManager.setNext(res)
            }
          } catch (e) {
            console.error('handleBeforeRouteLeave', e)
          }
        }
      }
    }

    wepy.mixin({
      __routerHandler: '',

      beforeCreate() {
        this['$name'] = this.$options.name
        this['$encodeParams'] = encodeParams
        this['$encodeUrl'] = encodeUrl
        this['$decodeParams'] = decodeParams
        this['$decodePage'] = decodePage
        this['$decodeUrl'] = decodeUrl
        this['$router'] = router

        // 判断是否是组件 0 为页面，1 为组件
        if (last(this.$id) === '1') {
          Object.defineProperty(this, '$route', { get: () => this.$root.$route })
        }
      },

      created() {
        // 判断是否是组件 0 为页面，1 为组件
        if (last(this.$id) === '1') {
          return
        }

        resetPageRoute.call(this)

        handleTmpRoute()

        handleTapTab.call(this)

        updateRouteManager.call(this)

        setThisRoute.call(this)

        handleGuards.call(this)

        function resetPageRoute() {
          // 保底处理，tab 页
          if (config.tabPages.indexOf(this.$name) !== -1) {
            routeManager.clearRoutes()
          }

          if (_isExternalJump) {
            updateIsExternalJump(false)
            updateIsCallAppShow(false)

            routeManager.clearRoutes()
            routeManager.clearShowRoutes()

            setCurrentRoute(this.$name, _externalQuery)
          }
        }

        function handleTapTab() {
          // 点击 tab
          if (routeManager.route.name !== this.$name) {
            setCurrentRoute(this.$name, {})
          }
        }

        function setCurrentRoute(name, query) {
          const fullPath = encodeUrl({ name, query })
          routeManager.setCurrentRoute(routeManager.createRoute({ name, query, fullPath }))
        }

        function updateRouteManager() {
          routeManager.setCurrentVm(this)
          routeManager.pushRoute(routeManager.route)
          routeManager.pushShowRoute(routeManager.route)
          routeManager.updateCurrentRoute({
            id: this.$id,
            routes: [...routeManager.routes],
            referrerRoute: routeManager.referrerRoute
          })
        }

        function setThisRoute() {
          this['$_route'] = routeManager.route
          Object.defineProperty(this, '$route', {
            get: () => this.$_route
          })
        }
      },

      onLaunch(options) {
        updateIsExternalJump(true)
      },

      onShow(options) {
        // App onShow
        if (!('$app' in this)) {
          handleAppOnShow.call(this, options)
          return
        }

        handleTmpRoute()

        // 手势滑动返回 或者 点击 tab 或者 其它方式，进入已经存在的页面
        if (routeManager.route !== this.$_route) {
          // 其它方式跳转过来
          if (routeManager.route.name === this.$name) {
            this['$_route'] = routeManager.route
          }

          // tab 页
          if (config.tabPages.indexOf(this.$name) !== -1) {
            routeManager.clearRoutes()
            routeManager.pushRoute(this.$_route)
          }

          updateRouteManager.call(this)
          handleGuards.call(this)
        }

        function handleAppOnShow(options) {
          updateIsCallAppShow(true)
          updateExternalQuery(options.query)
        }

        function updateRouteManager() {
          routeManager.setCurrentVm(this)
          routeManager.setCurrentRoute(this.$_route)
          routeManager.pushShowRoute(routeManager.route)
          routeManager.updateCurrentRoute({ referrerRoute: routeManager.referrerRoute })
        }
      },

      onUnload() {
        if (_isCallAppShow) {
          updateIsCallAppShow(false)
          updateIsExternalJump(true)
        }

        routeManager.popRoute()
      }
    })
  }
}

function handleGuards() {
  try {
    guard.globalGuard.afterEachGuards.forEach(guard => guard(routeManager.route, routeManager.lastRoute))
  } catch (e) {
    console.error('handleGuards afterEach', e)
  }

  if (routeManager.next) {
    try {
      routeManager.next(this)
    } catch (e) {
      console.error('routeManager.next', e)
    }
    routeManager.clearNext()
  }
}

function last(list, index = 1) {
  return list[list.length - index] || null
}

// hack 处理，因为 onHide 时拿到的 route 不对
function handleTmpRoute() {
  if (routeManager.__tempRoute) {
    routeManager.setCurrentRoute(routeManager.__tempRoute)
    delete routeManager.__tempRoute
  }
}

function updateIsExternalJump(val) {
  _isExternalJump = val
}

function updateIsCallAppShow(val) {
  _isCallAppShow = val
}

function updateExternalQuery(query) {
  _externalQuery = query
}
