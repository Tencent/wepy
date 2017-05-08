/**
 * @author: Gcaufy
 * @description: wx.showToast(OBJECT)
 * @link: https://mp.weixin.qq.com/debug/wxadoc/dev/api/api-react.html#wxshowtoastobject

 * @properties:
 * 参数  类型  必填  说明  最低版本
 * title String  是 提示的内容 
 * icon  String  否 图标，有效值 "success", "loading" 
 * image String  否 自定义图标的本地路径，image 的优先级高于 icon  1.1.0
 * duration  Number  否 提示的延迟时间，单位毫秒，默认：1500  
 * mask  Boolean 否 是否显示透明蒙层，防止触摸穿透，默认：false  
 * success Function  否 接口调用成功的回调函数 
 * fail  Function  否 接口调用失败的回调函数 
 * complete  Function  否 接口调用结束的回调函数（调用成功、失败都会执行）
 *
 * wx.showToast({
 * title: '成功',
 * icon: 'success',
 * duration: 2000
 * })
 */

<template>
    <div class="wepy-api-toast" v-show="show">
        <div class="wepy-api-toast__mask" v-show="mask"></div>
        <div class="wepy-api-toast__bd">
            <div v-show="icon">
                <div class="wepy-api-toast__bd__img" :class="icon === 'loading' ? 'wepy-api-toast__bd__img__loading' : 'wepy-api-toast__bd__img__success'"></div>
            </div>
            <div class="wepy-api-toast__bd__title">{{title}}</div>
        </div>
    </div>
</template>
<script>

export default {
    name: 'Toast',

    data () {
        return {
            icon: '',
            image: '',
            mask: false,
            duration: 1500,
            show: false,
            title: '温馨提示',
        };
    }
}

export function getter (constructor) {
    return (config) => {
        if (!config.title) {
            throw 'title is required in wx.showToast';
        }
        if (!this.instance) {
            this.instance = new constructor({
                el: document.createElement('div')
            });
            this.instance.$appendTo(document.body);
        }
        wx.$toast = this.instance;
        Object.assign(this.instance, config);
        this.instance.show = true;
        if (typeof config.success === 'function') {
            config.success();
        }
        if (typeof config.complete === 'function') {
            config.complete();
        }
        setTimeout(() => {
            this.instance.show = false;
        }, this.instance.duration);
    };
}
</script>

<style lang="less">
@import "../components/styles/mixin/icon-font.less";
@import "../components/styles/mixin/loading.less";

.wepy-api-toast__bd__img:extend(.wepy_icon) {}

.wepy-api-toast__bd__img__success { color: #fff }

.wepy-api-toast__bd__img__success:before:extend(.wepy_icon-success:before){
    font-size: 50px;
    margin-top: 18px;
}

.wepy-api-toast__bd__img__loading:extend(.wepy_loading) {
    width: 50px;
    height: 50px;
    margin-top: 18px;
}

.wepy-api-toast__mask {
    position: fixed;
    z-index: 1000;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
}

.wepy-api-toast__bd {
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

.wepy-api-toast__bd__img_desc {
    width: 55px;
    height: 55px;
    vertical-align: middle;
}

.wepy-api-toast__bd__title {
    margin: 3px 0;
    font-size: 1.2em;
}
</style>