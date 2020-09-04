/**
 * @desc
 * @author wudi@supermonkey.com.cn
 * @createDate 2019/7/3
 */
import getRealPageInfo from './utils/getRealPageInfo'
import { encodeUrl } from './utils/urlParse'
import runQueue from './utils/queue'
import guard from './guard'
import routeManager from './routeManager'
import config from './config'

const errorHandlers = []

/**
 * 将路由接口（'navigateBack', 'navigateTo', 'redirectTo', 'reLaunch', 'switchTab'）promise化
 * 修改传入参数。由 url 改为 name、query
 * name 为页面名称（String）、query 为页面参数的键值对（Object）
 */
const wxApiList = ['navigateBack', 'navigateTo', 'redirectTo', 'reLaunch', 'switchTab']
const promiseRouteApi = jumpMethodName => async (params = {}, encode = false) => {
  const { success = () => {}, fail = () => {}, complete = () => {}, delta = 1, name, query = {}, ...otherParams } = params

  if (jumpMethodName !== 'navigateBack' && name === undefined) {
    throw new Error('页面跳转没有传入 name')
  }

  // 解析出真正要跳转的页面
  const { pageMethod, pageDelta, realPage, pageData, pageMeta, pageEncode, pages } = await runGuard({
    name, query, delta, jumpMethodName, encode
  })

  // 处理 beforeRouteUpdate
  if (realPage === routeManager.route.name) {
    routeManager.updateCurrentRoute({ query: pageData, meta: pageMeta })

    return true
  }

  // hack 处理，因为 onHide 时拿到的 route 不对
  routeManager['__tempRoute'] = getRoute({
    pageMethod, pageDelta, realPage, pageData, pageMeta, pages
  })

  return handleNavigator(
    getRealMethod({ pageMethod, realPage }),
    getNavigatorParams({
      pageMethod, pageDelta, realPage, pageData, pageEncode
    }),
    { success, fail, complete }
  )

  async function runGuard({ name, query = {}, delta, jumpMethodName = 'navigateTo', encode }) {
    routeManager.clearNext()

    const to = getTo({
      name, query, delta, jumpMethodName, encode
    })
    try {
      await runQueue(getGuardQueue(to.name, to.pages), guard => new Promise(async (resolve, reject) => {
        const handleNext = createHandleNext()
        try {
          const res = await guard(
            to,
            routeManager.route,
            handleNext.bind(null, resolve, reject)
          )

          res !== undefined && handleNext(resolve, reject, res)
        } catch (e) {
          handleNext(resolve, reject, e)
        }

        function createHandleNext() {
          let isExecuted = false

          return (resolve, reject, to) => {
            if (isExecuted) {
              return
            }

            isExecuted = true

            if (to === false) {
              reject(new Error('router to: false'))
            } else if (type(to) === 'Error') {
              reject(to)

              errorHandlers.forEach(errorHandler => errorHandler(to))
            } else if (type(to) === 'Object') {
              reject(to)
            } else if (type(to) === 'Function') {
              resolve()

              routeManager.setNext(to)
            } else {
              resolve()
            }
          }
        }
      }))
    } catch (e) {
      if (type(e) === 'Object') {
        return runGuard(e)
      }

      throw e
    }

    return {
      pageMethod: jumpMethodName,
      pageDelta: delta,
      realPage: to.name,
      pageData: to.query,
      pageMeta: to.meta,
      pageEncode: encode,
      pages: to.pages
    }

    function getTo({ name, query, delta, jumpMethodName, encode }) {
      if (jumpMethodName === 'navigateBack') {
        return {
          ...routeManager.routes[routeManager.routes.length - 1 - delta],
          jumpMethodName,
          delta,
          pages: [routeManager.routes[routeManager.routes.length - 1 - delta].name]
        }
      }

      const { pageData = {}, pageMeta, pages } = getRealPageInfo({ name, query })

      return {
        name: pages[pages.length - 1], query: pageData, meta: pageMeta, jumpMethodName, encode, pages
      }
    }

    function getGuardQueue(name, pages) {
      if (name === routeManager.route.name) {
        const beforeGuards = [...guard.componentGuardMap[name].beforeRouteUpdateGuards]

        return [
          ...beforeGuards.map(beforeGuard => beforeGuard.bind(routeManager.currentVm))
        ]
      }

      const beforeGuards = [
        ...guard.componentGuardMap[routeManager.route.name].beforeRouteLeaveGuards,
        ...guard.globalGuard.beforeEachGuards,
        ...getBeforeEnterGuards(pages)
      ]

      return [
        ...beforeGuards.map(beforeGuard => beforeGuard.bind(routeManager.currentVm)),
        ...getBeforeRouteEnterGuards(name),
        ...guard.globalGuard.beforeResolveGuards
      ]

      function getBeforeRouteEnterGuards(name) {
        if (name in guard.componentGuardMap) {
          return guard.componentGuardMap[name].beforeRouteEnterGuards
        }

        return []
      }

      function getBeforeEnterGuards(pages) {
        const result = []

        pages.forEach(name => Array.prototype.push.apply(result, guard.routerGuardMap[name].beforeEnterGuards))

        return result
      }
    }
  }

  function getRoute({ pageMethod, pageDelta, realPage, pageData, pageMeta, pages }) {
    return pageMethod === 'navigateBack'
      ? Object.assign({}, routeManager.routes[routeManager.routes.length - 1 - pageDelta])
      : routeManager.createRoute({
        name: realPage,
        query: pageData,
        meta: pageMeta,
        fullPath: encodeUrl({ name: realPage, query: pageData }),
        redirectedFrom: pages[pages.length - 2] || null
      })
  }

  function handleNavigator(method, params, { success, fail, complete }) {
    return new Promise(((resolve, reject) => {
      setTimeout(() => wx[method]({
        ...params,
        ...otherParams,
        success: (...res) => {
          resolve(...res)
          success(...res)
        },
        fail: (...res) => {
          reject(...res)
          fail(...res)
        },
        complete
      }), 1)
    }))
  }

  function getRealMethod({ pageMethod, realPage }) {
    // 确定跳转页面的跳转方式
    if ((config.tabPages.indexOf(realPage) !== -1) && (pageMethod === 'navigateTo' || pageMethod === 'redirectTo')) {
      return 'switchTab'
    }

    return pageMethod
  }

  function getNavigatorParams({ pageMethod, pageDelta, realPage, pageData, pageEncode }) {
    return pageMethod === 'navigateBack'
      ? { delta: pageDelta }
      : { url: encodeUrl({ name: realPage, query: pageData }, { encode: pageEncode, isAbsolutePath: true }) }
  }
}

const routerApi = {}
wxApiList.forEach(key => (routerApi[key] = promiseRouteApi(key)))

routerApi['onError'] = handler => errorHandlers.push(handler)
routerApi['backHome'] = () => routerApi.switchTab({ name: config.homePage })

export default routerApi

function type(val) {
  const type = val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1)

  return val === null ? 'Null' : type
}
