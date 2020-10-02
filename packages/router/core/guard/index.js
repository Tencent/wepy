/**
 * @desc
 * @author wudi@supermonkey.com.cn
 * @createDate 2019/11/18
 */
import createComponentGuard from './createComponentGuard'
import createRouterGuard from './createRouterGuard'
import globalGuard from './globalGuard'

const routerGuardMap = {}
const componentGuardMap = {}

export {
  createComponentGuard,
  createRouterGuard
}

export default {
  get globalGuard() {
    return globalGuard
  },
  get routerGuardMap() {
    return routerGuardMap
  },
  get componentGuardMap() {
    return componentGuardMap
  },
  updateRouterGuardMap(routerGuard) {
    routerGuardMap[routerGuard.name] = routerGuard
  },
  updateComponentGuardMap(componentGuard) {
    componentGuardMap[componentGuard.name] = componentGuard
  },
  hasInRouterGuardMap(name) {
    return name in routerGuardMap
  },
  hasInComponentGuardMap(name) {
    return name in componentGuardMap
  }
}
