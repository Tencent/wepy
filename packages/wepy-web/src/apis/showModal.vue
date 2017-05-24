/**
* @author: Gcaufy
* @description: wx.showModal(OBJECT)
* @link: https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-react.html#wxshowmodalobject

* @properties:
* title   String  是   提示的标题
* content String  是   提示的内容
* showCancel  Boolean 否   是否显示取消按钮，默认为 true
* cancelText  String  否   取消按钮的文字，默认为"取消"，最多 4 个字符
* cancelColor HexColor    否   取消按钮的文字颜色，默认为"#000000"
* confirmText String  否   确定按钮的文字，默认为"确定"，最多 4 个字符
* confirmColor    HexColor    否   确定按钮的文字颜色，默认为"#3CC51F"
* success Function    否   接口调用成功的回调函数
* fail    Function    否   接口调用失败的回调函数
* complete    Function    否   接口调用结束的回调函数（调用成功、失败都会执行）
*
* wx.showModal({
*   title: '提示',
*   content: '这是一个模态弹窗',
*   success: function(res) {
*     if (res.confirm) {
*       console.log('用户点击确定')
*     } else if (res.cancel) {
*       console.log('用户点击取消')
*     }
*   }
* })
*/

<template>
    <div class="wepy-api-dialog" v-show="show">
        <div class="wepy-api-dialog__mask"></div>
        <div class="wepy-api-dialog__main">
            <div class="wepy-api-dialog__hd" v-show="title.length"><strong class="wepy-api-dialog__title">{{title}}</strong></div>
            <div class="wepy-api-dialog__bd" v-show="content.length">{{content}}</div>
            <div class="wepy-api-dialog__ft">
                <a href="javascript:;" class="wepy-api-dialog__btn wepy-api-dialog__btn_default" @click="cancel" v-show="showCancel" :style="{color: cancelColor}">{{cancelText}}</a>
                <a href="javascript:;" class="wepy-api-dialog__btn wepy-api-dialog__btn_primary" @click="confirm" :style="{color: confirmColor}">{{confirmText}}</a>
            </div>
        </div>
    </div>
</template>

<script>

const DEFAULT_PROPERTIES = {
    title: '提示的标题',
    content: '提示的内容',
    showCancel: true,
    cancelText: '取消',
    cancelColor: '#000000',
    confirmText: '确定',
    confirmColor: '#3CC51F'
};

export default {
    name: 'Modal',

    data () {
        return Object.assign({show: false}, DEFAULT_PROPERTIES);
    },

    methods: {
        cancel () {
            this.show = false;
            let rst = {
                errMsg: "showModal:ok",
                cancel: true,
                confirm: false
            };
            typeof(this.success) === 'function' && this.success(rst);
            typeof(this.complete) === 'function' && this.complete(rst);
        },
        confirm (index) {
            this.show = false;
            let rst = {
                errMsg: "showModal:ok",
                cancel: false,
                confirm: true
            };
            typeof(this.success) === 'function' && this.success(rst);
            typeof(this.complete) === 'function' && this.complete(rst);
        }
    }
}

export function getter (constructor) {
    return (config) => {
        if (!config.content) {
            throw 'content is required in wx.showModal';
        }
        if (!this.instance) {
            this.instance = new constructor({
                el: document.createElement('div')
            });
            this.instance.$appendTo(document.body);
        }
        wx.$modal = this.instance;
        Object.assign(this.instance, DEFAULT_PROPERTIES, {fail: void 0, success: void 0, complete: void 0}, config);
        this.instance.show = true;
    };
}
</script>


<style lang="less">
.wepy-api-dialog__mask {
    position: fixed;
    z-index: 1000;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
}
.wepy-api-dialog__main {
    position: fixed;
    z-index: 5000;
    width: 80%;
    max-width: 300px;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    background-color: #FFFFFF;
    text-align: center;
    border-radius: 3px;
    overflow: hidden;
}
.wepy-api-dialog__hd {
    padding: 1.3em 1.6em 0.5em;
}
.wepy-api-dialog__title {
    font-weight: 400;
    font-size: 18px;
}
.wepy-api-dialog__bd {
    padding: 0 1.6em 0.8em;
    min-height: 40px;
    font-size: 15px;
    line-height: 1.3;
    word-wrap: break-word;
    word-break: break-all;
    color: #999999;
}
.wepy-api-dialog__ft {
    position: relative;
    line-height: 48px;
    font-size: 18px;
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
}
.wepy-api-dialog__btn_default {
    color: #353535;
}
.wepy-api-dialog__btn {
    display: block;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    flex: 1;
    color: #3CC51F;
    text-decoration: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    position: relative;
}
.wepy-api-dialog__btn_primary {
    color: #0BB20C;
}
.wepy-api-dialog__btn {
    display: block;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    flex: 1;
    color: #3CC51F;
    text-decoration: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    position: relative;
}
.wepy-api-dialog__btn:after {
    content: " ";
    position: absolute;
    left: 0;
    top: 0;
    width: 1px;
    bottom: 0;
    border-left: 1px solid #D5D5D6;
    color: #D5D5D6;
    -webkit-transform-origin: 0 0;
    transform-origin: 0 0;
    -webkit-transform: scaleX(0.5);
    transform: scaleX(0.5);
}
</style>
