/**
 * @desc
 * @author wudi@supermonkey.com.cn
 * @createDate 2019/11/18
 */
import guard, { createRouterGuard } from './guard'
import getRealPageInfo from './utils/getRealPageInfo'
import { setConfig } from './config'
import routeManager from './routeManager'
import routerApi from './routerApi'

/**
 * 创建路由实例
 * @param config 路由配置
 */
export default function createRouter(config) {
  config['routeMap'] = normalizeRouteMap(config.routeMap)
  setConfig(config)

  return {
    getRealPageInfo,
    ...config,
    ...routerApi,
    get currentVm() {
      return routeManager.currentVm
    },
    get route() {
      return routeManager.route
    },
    beforeEach: cb => guard.globalGuard.beforeEach(cb),
    beforeResolve: cb => guard.globalGuard.beforeResolve(cb),
    afterEach: cb => guard.globalGuard.afterEach(cb)
  }

  function normalizeRouteMap(routeMap) {
    const normalizeRouteMap = {}

    for (const key in routeMap) {
      if (!guard.hasInRouterGuardMap(key)) {
        guard.updateRouterGuardMap(createRouterGuard(key))
      }

      if (typeof routeMap[key] === 'string') {
        normalizeRouteMap[key] = { handler: () => handleStrResult(routeMap[key]) }
      } else if (typeof routeMap[key] === 'function') {
        normalizeRouteMap[key] = { handler: createHandler(routeMap[key]) }
      } else {
        if ('handler' in routeMap[key]) {
          normalizeRouteMap[key] = { handler: createHandler(routeMap[key].handler) }
        } else {
          normalizeRouteMap[key] = { handler: () => routeMap[key] }
        }

        if ('beforeEnter' in routeMap[key]) {
          normalizeRouteMap[key]['beforeEnter'] = routeMap[key].beforeEnter
        }
      }

      if ('beforeEnter' in normalizeRouteMap[key]) {
        guard.routerGuardMap[key].beforeEnter(normalizeRouteMap[key].beforeEnter)
      }
    }

    return normalizeRouteMap

    function createHandler(fn) {
      return ({ query }) => {
        const result = fn({ query })

        if (typeof result === 'string') {
          return handleStrResult(result)
        }

        return result
      }
    }

    function handleStrResult(str) {
      if (str.indexOf('/') === -1) {
        return { name: str }
      }

      return { path: str }
    }
  }
}
