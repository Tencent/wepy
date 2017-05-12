/**
* @author: dlhandsome
* @description: wx.showLoading(OBJECT)
* @link: https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-react.html#wxshowloadingobject

* @properties:
* 参数	类型	必填	说明
* title	String	是	提示的内容
* mask	Boolean	否	是否显示透明蒙层，防止触摸穿透，默认：false
* success	Function	否	接口调用成功的回调函数
* fail	Function	否	接口调用失败的回调函数
* complete	Function	否	接口调用结束的回调函数（调用成功、失败都会执行）
*
* wx.showToast({
* title: '加载中'
* })
*/

<template>
    <div class="wepy-api-loading" v-show="show">
        <div class="wepy-api-loading__mask" v-show="mask"></div>
        <div class="wepy-api-loading__bd">
            <div class="wepy-api-loading__bd__img wepy-api-loading__bd__img__loading"></div>
            <div class="wepy-api-loading__bd__title">{{title}}</div>
        </div>
    </div>
</template>
<script>

export default {
    name: 'Loading',

    data () {
        return {
            show: true,
            mask: false,
            title: '',
        };
    }
}

export function getter (constructor) {
    return (config) => {
        if (!config.title) {
            throw 'title is required in wx.showLoading';
        }
        if (!this.instance) {
            this.instance = new constructor({
                el: document.createElement('div')
            });
            this.instance.$appendTo(document.body);
        }
        wx.$loading = this.instance;
        Object.assign(this.instance, config);
        this.instance.show = true;
        if (typeof config.success === 'function') {
            config.success();
        }
        if (typeof config.complete === 'function') {
            config.complete();
        }
    };
}
</script>

<style lang="less">
@import "../components/styles/mixin/icon-font.less";
@import "../components/styles/mixin/loading.less";

.wepy-api-loading__bd__img:extend(.wepy_icon) {}

.wepy-api-loading__bd__img__loading:extend(.wepy_loading) {
    width: 50px;
    height: 50px;
    margin-top: 18px;
}

.wepy-api-loading__mask {
    position: fixed;
    z-index: 1000;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
}

.wepy-api-loading__bd {
    display: flex;
    flex-direction: column;
    position: fixed;
    z-index: 5000;
    min-width: 8.4em;
    min-height: 8.4em;
    max-width: 70%;
    top: 140px;
    left: 50%;
    padding: 15px;
    box-sizing: border-box;
    transform: translateX(-50%);
    background: rgba(40, 40, 40, 0.75);
    border-radius: 5px;
    color: #FFFFFF;
    word-wrap: break-word;
    word-break: break-all;
    align-items: center;
    justify-content: space-around;
}

.wepy-api-loading__bd__title {
    margin: 3px 0;
    font-size: 1.2em;
}
</style>