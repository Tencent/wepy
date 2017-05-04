<!--
@author: dlhandsome
@description: 小程序视图容器view
@link: https://mp.weixin.qq.com/debug/wxadoc/dev/component/view.html

@properties:
hover	Boolean	false	是否启用点击态
hover-class	String	none	指定按下去的样式类。当 hover-class="none" 时，没有点击态效果
hover-start-time	Number	50	按住后多久出现点击态，单位毫秒
hover-stay-time	Number	400	手指松开后点击态保留时间，单位毫秒
-->
<template>
    <div class="wepy_view"
         :class="isHover ? hoverClass : ''"
         @touchstart="touchstart"
         @touchend="touchend">
        <slot></slot>
    </div>
</template>
<script>

export default {
    name: 'view',

    data () {
        return {
            isHover: false
        }
    },

    props: {
        'hover': {
            type: Boolean,
            default: false
        },
        'hoverClass': {
            type: String,
            default: 'none'
        },
        'hoverStartTime': {
            type: Number,
            default: 50
        },
        'hoverStayTime': {
            type: Number,
            default: 400
        }
    },

    methods: {
        touchstart () {
            if (this.hover && this.hoverClass !== 'none') {
                setTimeout(() => {
                    this.isHover = true
                }, this.hoverStartTime)
            }
        },
        touchend () {
            if (this.hover && this.hoverClass !== 'none') {
                setTimeout(() => {
                    this.isHover = false
                }, this.hoverStayTime + this.hoverStartTime)
            }
        }
    }
}
</script>

<style lang="less">
.wepy_view{
    display: block;
}
</style>
