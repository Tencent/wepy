
const _currentRoutes = []
const _showRoutes = []
let _next = null
let _currentVm = null
let _currentRoute = null

// 页面参数缓存
const routeManager = {
  get currentVm() {
    return _currentVm
  },
  get next() {
    return _next
  },
  get routes() {
    return _currentRoutes
  },
  get route() {
    return _currentRoute
  },
  get referrerRoute() {
    if (_showRoutes.length <= 1) {
      return null
    }

    return _showRoutes[0]
  },

  get lastRoute() {
    return nthRoute(routeManager.routes, -2)
  },

  setCurrentVm(vm) {
    _currentVm = vm
  },
  setNext(next) {
    _next = next
  },
  clearNext() {
    _next = null
  },
  createRoute(params) {
    const {
      id = null,
      name,
      query = {},
      routes = null,
      fullPath,
      referrerRoute = null,
      meta = null,
      redirectedFrom = null
    } = params

    const path = fullPath.split('?')[0]

    return {
      id, name, query, routes, path, fullPath, referrerRoute, meta, redirectedFrom
    }
  },
  setCurrentRoute(route) {
    _currentRoute = route
  },
  updateCurrentRoute(params) {
    Object.assign(_currentRoute, params)
  },
  pushRoute(route) {
    _currentRoutes.push(route)

    return route
  },
  popRoute() {
    return _currentRoutes.pop()
  },
  clearRoutes() {
    _currentRoutes.length = 0
  },
  pushShowRoute(route) {
    if (last(_showRoutes) && route.id === last(_showRoutes).id) {
      return route
    }

    _showRoutes.push(route)

    if (_showRoutes.length > 2) {
      _showRoutes.shift()
    }

    return route
  },
  clearShowRoutes() {
    _showRoutes.length = 0
  }
}

export default routeManager

function last(list, index = 1) {
  return list[list.length - index] || null
}

function nthRoute(routes, index) {
  return (index >= 0 ? routes[index] : last(routes, -index)) || null
}
