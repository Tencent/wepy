/**
 * @author: dlhandsome
 * @description: wx.hideLoading()
 * @link: https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-react.html#wxhidetoast
 */

export function getter () {
	return () => {
		wx.$loading.show = false;
	};
};