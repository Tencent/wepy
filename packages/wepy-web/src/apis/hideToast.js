/**
 * @author: Gcaufy
 * @description: wx.hideToast()
 * @link: https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-react.html#wxhidetoast
 */

export function getter (constructor) {
    return () => {
        wx.$toast.show = false;
    };
};