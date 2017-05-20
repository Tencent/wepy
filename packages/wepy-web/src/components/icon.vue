<!--
@author: dlhandsome
@description: 小程序基础组件icon
@link: https://mp.weixin.qq.com/debug/wxadoc/dev/component/icon.html

@properties:
type  String    icon的类型，有效值：success, success_no_circle, info, warn, waiting, cancel, download, search, clear
size  Number  23  icon的大小，单位px
color Color   icon的颜色，同css的color
-->
<template>
    <div class="wepy_icon" :class="'wepy_icon-' + type" :style="style"></div>
</template>
<script>

const VALID_TYPES = ['success', 'success_no_circle', 'info', 'warn', 'waiting', 'cancel', 'download', 'search', 'clear'];

export default {
    name: 'icon',

    props: {
        'type': {
            type: String,
            default: '',
            validator (type) {
                return VALID_TYPES.indexOf(type) !== -1;
            }
        },
        'size': {
            type: [ Number, String ],
            default: 23
        },
        'color': {
            type: String,
            default: ''
        }
    },

    computed: {
        style () {
            return {
                color: this.color,
                fontSize: `${this.size}px`
            };
        }
    }
}
</script>

<style lang="less">
@import "styles/mixin/icon-font.less";
@import "styles/variable/color.less";


.wepy_icon-download { color: @green }
.wepy_icon-info { color: @blue }
.wepy_icon-success { color: @green }
.wepy_icon-success_no_circle { color: @green }
.wepy_icon-waiting { color: @blue }
.wepy_icon-warn { color: @pink }
.wepy_icon-cancel { color: @red }
.wepy_icon-search { color: @grey }
.wepy_icon-clear { color: @grey }
</style>
