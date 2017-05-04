<!--
@author: gcaufy
@description: 小程序基础组件button
@link: https://mp.weixin.qq.com/debug/wxadoc/dev/component/button.html

@properties:
size    String  default 按钮的大小   
type    String  default 按钮的样式类型 
plain   Boolean false   按钮是否镂空，背景色透明    
disabled    Boolean false   是否禁用    
loading Boolean false   名称前是否带 loading 图标   
form-type   String      用于 <form/> 组件，点击分别会触发 submit/reset 事件   
open-type   String      有效值：contact，打开客服会话  1.1.0
hover-class String  button-hover    指定按钮按下去的样式类。当 hover-class="none" 时，没有点击态效果  
hover-start-time    Number  20  按住后多久出现点击态，单位毫秒 
hover-stay-time Number  70  手指松开后点击态保留时间，单位毫秒

size 有效值：

值   说明
default 
mini
type 有效值：

值   说明
primary 
default 
warn
form-type 有效值：

值   说明
submit  提交表单
reset   重置表单
open-type 有效值：

值   说明  最低版本
contact 打开客服会话  1.1.0
-->
<template>
    <button class="wepy_button" type="{{type}}" :class="hover ? hoverClass : ''" @touchstart="touchstart" @touchend="touchend"><slot></slot></button>
</template>
<script>

const BUTTON_TYPES = ['default', 'primary', 'warn'];

export default {
    name: 'progress',

    props: {
        'size': {
            type: String,
            default: 'default'
        },
        'type': {
            type: String,
            default: 'default',
            coerce (val) {
                return (BUTTON_TYPES.indexOf(val) !== -1) ? val : BUTTON_TYPES[0];
            }
        },
        'plain': {
            type: Boolean,
            default: false
        },
        'disabled': {
            type: Boolean,
            default: false
        },
        'loading': {
            type: Boolean,
            default: ''
        },
        'form-type': {
            type: String,
            default: ''
        },
        'open-type': {
            type: String,
            default: ''
        },
        'hover-class': {
            type: String,
            default: ''
        },
        'hover-start-time': {
            type: [Number, String],
            default: 20
        },
        'hover-stay-time': {
            type: [Number, String],
            default: 70
        }
    },

    data () {
        return {
            hover: false
        }
    },

    methods: {
        touchstart () {
            clearInterval(this.stayInterval);
            if (!this.startInterval) {
                this.startInterval = setInterval(() => {
                    this.hover = true;
                }, this.hoverStartTime);
            }
        },
        touchend () {
            clearInterval(this.startInterval);
            if (!this.stayInterval) {
                this.stayInterval = setInterval(() => {
                    this.hover = false;
                }, this.hoverStayTime);
            }
        }
    }
}
</script>

<style lang="less" scoped>
.wepy_button {
    position:relative;
    display:block;
    margin-left:auto;
    margin-right:auto;
    padding-left:14px;
    padding-right:14px;
    box-sizing:border-box;
    font-size:18px;
    text-align:center;
    text-decoration:none;
    line-height:2.55555556;
    border-radius:5px;
    -webkit-tap-highlight-color:transparent;
    overflow:hidden;
    color:#000000;
    background-color:#F8F8F8;
    -webkit-appearance:none;
    outline:none;
    border: none;
    width: 100%;
}
.wepy_button::after {
    content:" ";
    width:200%;
    height:200%;
    position:absolute;
    top:0;
    left:0;
    border:1px solid rgba(0, 0, 0, 0.2);
    -webkit-transform:scale(0.5);
    transform:scale(0.5);
    -webkit-transform-origin:0 0;
    transform-origin:0 0;
    box-sizing:border-box;
    border-radius:10px;
}
.wepy_button[type="default"] {
    color: #000;
    background-color: #F8F8F8;
}
.wepy_button[type="primary"] {
    color: #FFF;
    background-color: #1AAD19;
}
.wepy_button[type="warn"] {
    color: #FFF;
    background-color: #E64340;
}

</style>
