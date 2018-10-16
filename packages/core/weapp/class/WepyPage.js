import Base from './Base';
import { isStr, isObj, isUndef, isFunc } from '../../shared/index';

export default class WepyPage extends Base {

  $navigate (url, params) {
    this.$route('navigate', url, params);
  }

  $redirect (url, params) {
    this.$route('redirect', url, params);
  }

  $back () {}

  $route (type, url, params = {}) {
    let wxparams;
    if (isStr(url)) {
      let paramsList = [];
      if (isObj(params)) {
        for (let k in params) {
          if (!isUndef(params[k])) {
            paramsList.push(`${k}=${encodeURIComponent(params[k])}`);
          }
        }
      }
      if (paramsList.length)
        url = url + '?' + paramsList.join('&');

      wxparams = { url: url };
    } else {
      wxparams = url;
    }
    let fn = wx[type + 'To'];
    if (isFunc(fn)) {
      return fn(wxparams);
    }
  }
}
