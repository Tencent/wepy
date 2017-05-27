<!--
@author: dlhandsome
@description: 小程序表单组件radio-group
@link: https://mp.weixin.qq.com/debug/wxadoc/dev/component/radio.html

@properties:
bindchange	EventHandle		<radio-group/> 中的选中项发生变化时触发 change 事件，event.detail = {value: 选中项radio的value}
-->
<template>
    <div class="wepy_radio-group" :id="id">
        <slot></slot>
    </div>
</template>
<script>
import { uuid } from '../helper/util';

export default {
    name: 'radio-group',

    data () {
        return {
            id: `radio-${uuid()}`
        };
    }
}
</script>
