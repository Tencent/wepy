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
    let cookies = cookie.all();
    cookies.code = cookies.skey;
    wxSuccess('login', options, cookies);
};

/**
 * wx.requestPayment(OBJECT)
 * Object参数说明：
 * 
 * 参数  类型  必填  说明
 * timeStamp   String  是   时间戳从1970年1月1日00:00:00至今的秒数,即当前的时间
 * nonceStr    String  是   随机字符串，长度为32个字符以下。
 * package String  是   统一下单接口返回的 prepay_id 参数值，提交格式如：prepay_id=*
 * signType    String  是   签名算法，暂支持 MD5
 * paySign String  是   签名,具体签名方案参见微信公众号支付帮助文档;
 * success Function    否   接口调用成功的回调函数
 * fail    Function    否   接口调用失败的回调函数
 * complete    Function    否   接口调用结束的回调函数（调用成功、失败都会执行）
 */
wx.requestPayment = (params) => {
    if (mqq && mqq.tenpay && mqq.tenpay.pay) {
        mqq.tenpay.pay({
            tokenId: params.token,
            appInfo: params.appinfo,
            pubAcc: params.pubAcc,
            pubAccHint: params.pubAccHint
        }, function(result) {
            if (+result.resultCode === 0) {
                wxSuccess('requestPayment', params, result);
            } else {
                wxFail('requestPayment', params, result);
            }
        });
    }
};

/**
 * onShareAppMessage
 * 在 Page 中定义 onShareAppMessage 函数，设置该页面的转发信息。
 * 
 * 只有定义了此事件处理函数，右上角菜单才会显示 “转发” 按钮
 * 用户点击转发按钮的时候会调用
 * 此事件需要 return 一个 Object，用于自定义转发内容
 */
wx.__initShare = (share) => {
    if (mqq && mqq.ui && mqq.ui.setOnShareHandler) {
        mqq.ui.setOnShareHandler(function(type){
            mqq.ui.shareMessage({
                title: share.title,
                desc: share.desc,
                share_type: type,
                share_url: share.url,
                image_url: share.img,
                back: true
            });
        }, () => { });
    }
};

wx.__hideShare = () => {

};

wx.__platform = 'qq';

if (typeof window !== 'undefined') {
    window.wx = wx;
}

export default wx;