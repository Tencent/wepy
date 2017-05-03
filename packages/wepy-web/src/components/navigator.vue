<!--

@author: Gcaufy
@description: 小程序基础组件navigator
@link: https://mp.weixin.qq.com/debug/wxadoc/dev/component/navigator.html

@properties:
url String      应用内的跳转链接
open-type   String  navigate    跳转方式
delta   Number      当 open-type 为 'navigateBack' 时有效，表示回退的层数
hover-class String  navigator-hover 指定点击时的样式类，当hover-class="none"时，没有点击态效果
hover-start-time    Number  50  按住后多久出现点击态，单位毫秒
hover-stay-time Number  600 手指松开后点击态保留时间，单位毫秒

open-type 有效值：

值   说明  最低版本
navigate    对应 wx.navigateTo 的功能    
redirect    对应 wx.redirectTo 的功能    
switchTab   对应 wx.switchTab 的功能 
reLaunch    对应 wx.reLaunch 的功能  1.1.0
navigateBack    对应 wx.navigateBack 的功能  1.1.0
-->
<template>
    <a :href="url"></a>
</template>
<script>

const OPEN_TYPES = ['navigate', 'redirect', 'switchTab', 'reLaunch', 'navigateBack'];

export default {
    name: 'icon',

    props: {
        'url': {
            type: String,
            default: ''
        },
        'open-type': {
            type: String,
            default: 'navigate',
            coerce (val) {
                return (OPEN_TYPES.indexOf(val) !== -1) ? val : 'navigate'
            }
        },
        'delta': {
            type: [Number, String],
            default: 1
        },
        'hover-class': {
            type: String,
            default: 'navigator-hover'
        },
        'hover-start-time': {
            type: [Number, String],
            default: 50
        },
        'hover-start-time': {
            type: [Number, String],
            default: 600
        }
    }
}
</script>

<style lang="less" scoped>
</style>
