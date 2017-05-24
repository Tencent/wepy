/**
* @author: dlhandsome
* @description: wx.showLoading(OBJECT)
* @link: https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-react.html#wxshowloadingobject

* @properties:
* 参数  类型  必填  说明
* itemList    String Array    是   按钮的文字数组，数组长度最大为6个
* itemColor   HexColor    否   按钮的文字颜色，默认为"#000000"
* success Function    否   接口调用成功的回调函数，详见返回参数说明
* fail    Function    否   接口调用失败的回调函数
* complete    Function    否   接口调用结束的回调函数（调用成功、失败都会执行）
*
* wx.showActionSheet({
*   itemList: ['A', 'B', 'C'],
*   success: function(res) {
*     console.log(res.tapIndex)
*   },
*   fail: function(res) {
*     console.log(res.errMsg)
*   }
* })
*/

<template>
    <div class="wepy-api-actionsheet" v-show="show">
        <div class="wepy-api-actionsheet__mask" @click="cancel"></div>
        <div class="wepy-api-actionsheet__main wepy-api-actionsheet__toggle" id="iosActionsheet">
            <div class="wepy-api-actionsheet__menu">
                <div class="wepy-api-actionsheet__cell" v-for="(index, item) in itemList" @click="select(index)">{{item}}</div>
            </div>
            <div class="wepy-api-actionsheet__action">
                <div class="wepy-api-actionsheet__cell" @click="cancel">取消</div>
            </div>
        </div>
    </div>
</template>
<script>

export default {
    name: 'ActionSheet',

    data () {
        return {
            show: true,
            itemList: []
        };
    },

    methods: {
        cancel () {
            this.show = false;
            let rst = {
                errMsg: "showActionSheet:fail cancel"
            };
            typeof(this.fail) === 'function' && this.fail(rst);
            typeof(this.complete) === 'function' && this.complete(rst);
        },
        select (index) {
            this.show = false;
            let rst = {
                errMsg: "showActionSheet:ok",
                tapIndex: index
            };
            typeof(this.success) === 'function' && this.success(rst);
            typeof(this.complete) === 'function' && this.complete(rst);
        }
    }
}

export function getter (constructor) {
    return (config) => {
        if (!config.itemList) {
            throw 'itemList is required in wx.showActionSheet';
        }
        if (!this.instance) {
            this.instance = new constructor({
                el: document.createElement('div')
            });
            this.instance.$appendTo(document.body);
        }
        wx.$actionsheet = this.instance;
        Object.assign(this.instance, config);
        this.instance.show = true;
    };
}
</script>

<style lang="less">
.wepy-api-actionsheet__mask {
    position: fixed;
    z-index: 1000;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
}
.wepy-api-actionsheet__main {
    position: fixed;
    left: 0;
    bottom: 0;
    -webkit-transform: translate(0, 100%);
    transform: translate(0, 100%);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    z-index: 5000;
    width: 100%;
    background-color: #EFEFF4;
    -webkit-transition: -webkit-transform .3s;
    transition: -webkit-transform .3s;
    transition: transform .3s;
    transition: transform .3s, -webkit-transform .3s;
}
.wepy-api-actionsheet__toggle {
    -webkit-transform: translate(0, 0);
    transform: translate(0, 0);
}
.wepy-api-actionsheet__menu {
    background-color: #FCFCFD;
}
.wepy-api-actionsheet__cell {
    position: relative;
    padding: 10px 0;
    text-align: center;
    font-size: 18px;
}
.wepy-api-actionsheet__action {
    margin-top: 6px;
    background-color: #FCFCFD;
}
</style>
