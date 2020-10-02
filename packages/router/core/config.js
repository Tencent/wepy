/**
 * @desc
 * @author wudi@supermonkey.com.cn
 * @createDate 2019/11/18
 */
const config = {
  homePage: '',
  tabPages: [],
  routeMap: {}
}

function setConfig(obj) {
  Object.assign(config, obj)
}

export { setConfig }

export default config
