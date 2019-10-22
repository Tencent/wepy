import WepyComponent from './../../weapp/class/WepyComponent';
import { isStr, isNum, isObj, isUndef, isFunc } from '../../shared/index';

const wx = my;
export default class WepyPage extends WepyComponent {
  $launch(url, params) {
    this.$route('reLaunch', url, params);
  }
  $navigate(url, params) {
    this.$route('navigate', url, params);
  }

  $redirect(url, params) {
    this.$route('redirect', url, params);
  }

  $back(p = {}) {
    if (isNum(p))
      p = { delta: p };

    if (!p.delta)
      p.delta = 1;

    return wx.navigateBack(p);
  }

  $route(type, url, params = {}) {
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
    let fn = wx[type] || wx[type + 'To'];
    if (isFunc(fn)) {
      return fn(wxparams);
    }
  }
}
