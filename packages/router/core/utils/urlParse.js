/**
 * @desc
 * @author wudi@supermonkey.com.cn
 * @createDate 2019/11/15
 */
import getRealPageInfo from './getRealPageInfo'

/**
 * 编码url参数，如：{a: 123, b: 345} => a=123&b=456
 * @param obj
 * @param encode = false
 * return String
 */
function encodeParams(obj, encode = false) {
  const results = []

  for (const key in obj) {
    if (['string', 'number'].indexOf(typeof obj[key]) !== -1) {
      results.push(`${key}=${encode ? encodeURIComponent(obj[key]) : obj[key]}`)
    }
  }

  return results.join('&')
}

/**
 * 编码url参数，如：{ name: 'xxxxPage', query: {a: 123, b: 345} } => /pages/xxxxPage?a=123&b=456
 * @param obj
 * @param encode = false
 * @param isAbsolutePath = false 是否得到真实的页面（物理页面）
 * return String
 */
function encodeUrl({ name, query = {} }, { encode = false, isAbsolutePath = true } = {}) {
  const { pagePath, pageData } = isAbsolutePath ? getRealPageInfo({ name, query }) : { pagePath: name, pageData: query }
  const paramsStr = encodeParams(pageData, encode)

  return paramsStr ? `${pagePath}?${paramsStr}` : pagePath
}

/**
 * 解码 fullPath 或 params ，如：a=123&b=456 => { a: 123, b: 345 }
 * @param fullPath
 * @param decode = true
 * @returns {*}
 */
function decodeParams(fullPath, decode = true) {
  const splitArr = fullPath.split('?')
  const result = {}

  void (splitArr.length > 1 ? splitArr[1] : splitArr[0])
    .split('&')
    .map(str => str.split('='))
    .forEach(([key, value]) => (result[key] = decode ? decodeURIComponent(value) : value))

  return result
}

/**
 * 解析 /pages/xxxxPage?a=123&b=456 => xxxxPage
 * @param fullPath
 */
function decodePage(fullPath) {
  const result = fullPath.split('?')[0].split('/')

  return result[result.length - 1]
}

/**
 * 解析 fullPath 页面和参数。如: /pages/xxxxPage?a=123&b=456 => { name: xxxxPage, query: { a: 123, b: 345 } }
 * @param fullPath
 * @param decode = true
 * @return {{ query: *, name }}
 */
function decodeUrl(fullPath, decode = true) {
  return {
    name: decodePage(fullPath),
    query: decodeParams(fullPath, decode)
  }
}

export {
  encodeParams,
  encodeUrl,
  decodeParams,
  decodePage,
  decodeUrl
}
