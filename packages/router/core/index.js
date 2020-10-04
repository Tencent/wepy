/**
 * @desc
 * @author wudi@supermonkey.com.cn
 * @createDate 2020/3/5
 */
import { encodeParams, encodeUrl, decodeParams, decodePage, decodeUrl } from './utils/urlParse'
import createRouter from './createRouter'
import guard, { createComponentGuard } from './guard'
import routeManager from './routeManager'
import config from './config'

export {
  encodeParams,
  encodeUrl,
  decodeParams,
  decodePage,
  decodeUrl,
  createRouter,
  guard,
  createComponentGuard,
  routeManager,
  config
}
