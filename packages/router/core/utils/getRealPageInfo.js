/**
 * @desc
 * @author wudi@supermonkey.com.cn
 * @createDate 2019/11/15
 */
import config from '../config'

function getRealPageInfo({ name, query, meta }, pages = []) {
  if (!(name in config.routeMap)) {
    throw new Error(`routeMap 中未找到 ${name} 页面`)
  }

  pages.push(name)
  const result = config.routeMap[name].handler({ query })

  if ('path' in result) {
    return {
      pagePath: result.path,
      pageData: mergeRight(result.query, query),
      pageMeta: mergeRight(result.meta, meta),
      pages
    }
  }

  return getRealPageInfo(
    { name: result.name, query: mergeRight(result.query, query), meta: mergeRight(result.meta, meta) },
    pages
  )
}

export default getRealPageInfo

function mergeRight(dataA, dataB) {
  if (typeof dataA === 'undefined') {
    return dataB
  }

  if (typeof dataB === 'undefined') {
    return dataA
  }

  if (Object.prototype.toString.call(dataA) === '[object Object]'
    && Object.prototype.toString.call(dataA) === '[object Object]') {
    return Object.assign({}, dataA, dataB)
  }

  return dataB
}
