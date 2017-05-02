<!--
@author: dlhandsome
@description: 小程序基础组件progress
@link: https://mp.weixin.qq.com/debug/wxadoc/dev/component/progress.html

@properties:
percent	Float	无	百分比0~100
show-info	Boolean	false	在进度条右侧显示百分比
stroke-width	Number	6	进度条线的宽度，单位px
color	Color	#09BB07	进度条颜色 （请使用 activeColor）
activeColor	Color		已选择的进度条的颜色
backgroundColor	Color		未选择的进度条的颜色
active	Boolean	false	进度条从左往右的动画
-->
<template>
    <div class="wepy_progress">
        <div class="wepy_progress-bar" :style="barStyle">
            <div class="wepy_progress-inner_bar" :style="innerBarStyle"></div>
        </div>
        <div v-show="showInfo" class="wepy_progress-percent">{{ percent + '%' }}</div>
    </div>
</template>
<script>

export default {
    name: 'progress',

    props: {
        'percent': {
            type: [ Number, String ],
            default: 0,
            validator (percent) {
                const percentNum = Number(percent)
                return !isNaN(percentNum) && percentNum >= 0 && percentNum <= 100
            }
        },
        'showInfo': {
            type: Boolean,
            default: false
        },
        'strokeWidth': {
            type: [ Number, String ],
            default: 6
        },
        'color': {
            type: String,
            default: '#09BB07'
        },
        'activeColor': {
            type: String,
            default: ''
        },
        'backgroundColor': {
            type: String,
            default: ''
        },
        'active': {
            type: Boolean,
            default: false
        }
    },

    computed: {
        barStyle () {
            return {
                height: `${this.strokeWidth}px`,
                backgroundColor: this.backgroundColor
            }
        },
        innerBarStyle () {
            return {
                backgroundColor: this.activeColor || this.color,  // 优先级：activeColor > color ，两者均为进度条颜色字段
                width: `${this.percent}%`
            }
        }
    }
}
</script>

<style lang="less" scoped>
.wepy_progress{
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
}
.wepy_progress-bar{
    background-color: #EBEBEB;
    height: 6px;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    flex: 1;
}
.wepy_progress-inner_bar{
    width: 0;
    height: 100%;
    background-color: #09BB07;
}
.wepy_progress-percent{
    font-size: 16px;
    margin-left: 15px;
}
</style>
