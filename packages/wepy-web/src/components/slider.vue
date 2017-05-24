<!--
@author: Gcaufy
@description: 小程序基础组件slider
@link: https://mp.weixin.qq.com/debug/wxadoc/dev/component/slider.html

@properties:
min Number  0   最小值
max Number  100 最大值
step    Number  1   步长，取值必须大于 0，并且可被(max - min)整除
disabled    Boolean false   是否禁用
value   Number  0   当前取值
color   Color   #e9e9e9 背景条的颜色（请使用 backgroundColor）
selected-color  Color   #1aad19 已选择的颜色（请使用 activeColor）
activeColor Color   #1aad19 已选择的颜色
backgroundColor Color   #e9e9e9 背景条的颜色
show-value  Boolean false   是否显示当前 value
bindchange  EventHandle     完成一次拖动后触发的事件，event.detail = {value: value}
-->
<template>
    <div class="wepy_slider-box">
        <div class="wepy_slider">
            <div class="wepy_slider-inner" @click="click" :style="{backgroundColor: backgroundColor || color}">
                <div class="wepy_slider-track" :style="{width: percent + '%', backgroundColor: activeColor || selectedColor}"></div>
                <div class="wepy_slider-handler" :style="{left: percent + '%'}" @touchstart="touchstart" @touchmove="touchmove"></div>
            </div>
        </div>
        <div class="wepy_slider-value" v-show="showValue">{{percent}}</div>
    </div>
</template>
<script>

import { numberValidator, stringToBoolean } from '../helper/util';
import event from '../event';

export default {
    name: 'slider',

    props: {
        'min': {
            type: [ Number, String ],
            default: 0,
            validator: numberValidator()
        },
        'max': {
            type: [ Number, String ],
            default: 100,
            validator: numberValidator()
        },
        'step': {
            type: [ Number, String ],
            default: 1,
            validator: numberValidator()
        },
        'disabled': {
            type: [ Boolean, String ],
            default: false,
            coerce: stringToBoolean()
        },
        'value': {
            type: [ Number, String ],
            default: 0,
            validator: numberValidator()
        },
        'color': {
            type: String,
            default: '#e9e9e9'
        },
        'activeColor': {
            type: String,
            default: '#1aad19'
        },
        'selectedColor': {
            type: String,
            default: '#1aad19'
        },
        'backgroundColor': {
            type: String,
            default: '#e9e9e9'
        },
        'showValue': {
            type: [ Boolean, String ],
            default: false,
            coerce: stringToBoolean()
        }
    },

    data: function () {
        return {
            startLeft: 0,
            startX: 0,
            totalLen: 0
        }
    },

    computed: {
        percent () {
            if (this.value < this.min)
                return this.min;
            if (this.value > this.max)
                return this.max;
            return (this.value / this.step >> 0) * this.step;
        }
    },

    methods: {
        touchstart (e) {
            if (this.disabled)
                return;
            this.startLeft = this.value * this.totalLen / 100;
            this.startX = e.changedTouches[0].clientX;
        },
        touchmove (e) {
            if (this.disabled)
                return;
            let dist = this.startLeft + e.changedTouches[0].clientX - this.startX;
            dist = dist < 0 ? 0 : dist > this.totalLen ? this.totalLen : dist;
            this.value =  parseInt(dist / this.totalLen * 100);
            
            this.$emit('change', {
                type: 'change',
                detail: {
                    value: this.percent
                },
                currentTarget: this.$el
            });
            e.preventDefault();
        },
        click (e) {
            if (this.disabled)
                return;
            let dist = e.clientX - e.currentTarget.offsetLeft;
            dist = dist < 0 ? 0 : dist > this.totalLen ? this.totalLen : dist;
            this.value =  parseInt(dist / this.totalLen * 100);
            this.$emit('change', {
                type: 'change',
                detail: {
                    value: this.percent
                },
                currentTarget: this.$el
            });
            e.preventDefault();
        }
    },

    ready () {
        this.totalLen = this.$el.firstElementChild.firstElementChild.clientWidth;
    }
}
</script>

<style lang="less">
.wepy_slider-box {
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
}
.wepy_slider-value {
    margin-left: .5em;
    min-width: 24px;
    color: #888888;
    text-align: center;
    font-size: 14px;
}
.wepy_slider {
    padding: 15px 18px;
    -webkit-user-select: none;
    user-select: none;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    flex: 1;
}
.wepy_slider-inner {
    position: relative;
    height: 2px;
    background-color: #E9E9E9;
}
.wepy_slider-track {
    height: 2px;
    background-color: #1AAD19;
    width: 0;
}
.wepy_slider-handler {
    position: absolute;
    left: 0;
    top: 50%;
    width: 28px;
    height: 28px;
    margin-left: -14px;
    margin-top: -14px;
    border-radius: 50%;
    background-color: #FFFFFF;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
}
</style>
