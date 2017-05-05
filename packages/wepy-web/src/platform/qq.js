import cookie from '../helper/cookie';
import { wxSuccess, wxFail } from '../helper/util';

let wx = window.wx || {};

/**
 * wx.login(OBJECT)
 * OBJECT参数说明：
 * 参数名 类型  必填  说明
 * success Function    否   接口调用成功的回调函数
 * fail    Function    否   接口调用失败的回调函数
 * complete    Function    否   接口调用结束的回调函数（调用成功、失败都会执行）
 * success返回参数说明：
 * 
 * 参数名 类型  说明
 * errMsg  String  调用结果
 * code    String  用户允许登录后，回调内容会带上 code（有效期五分钟），开发者需要将 code 发送到开发者服务器后台，使用code 换取 session_key api，将 code 换成 openid 和 session_key
 */
wx.login = (options) => {
    debugger;
    let cookies = cookie.all();
    cookies.code = cookies.skey;
    wxSuccess('login', options, cookies);
}

if (typeof window !== 'undefined') {
    window.wx = wx;
}

export default wx;