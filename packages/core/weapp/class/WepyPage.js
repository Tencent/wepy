import Base from './Base';
import { isStr, isObj } from '../../shared/index';

export default class WepyPage extends Base {

  $navigate (url, params) {
    this.$route('navigate', url, params);
  }

  $redirect (url, params) {
    this.$route('redirect', url, params);
  }

  $back () {}

  $route (type, url, params = {}) {
    if (isStr(url)) {
      let paramsStr = '';
      if (isObj(params)) {
        for (let k in params) {
          if (isObj(params[k])) {
            s += `${k}=${encodeURIComponent(params[k])}`;
          }
        }
      } else if (isStr(params) && params[0] === '?') {
        paramsStr = params;
      }
    } else {
      // TODO: { url: './a?a=1&b=2' }
    }

    let fn = wx[type + 'To'];
    fn && fn(url);
  }
}
