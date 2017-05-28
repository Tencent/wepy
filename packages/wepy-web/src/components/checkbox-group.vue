<!--
@author: dlhandsome
@description: 小程序表单组件checkbox-group
@link: https://mp.weixin.qq.com/debug/wxadoc/dev/component/checkbox.html

@properties:
bindchange	EventHandle		<checkbox-group/>中选中项发生改变是触发 change 事件，detail = {value:[选中的checkbox的value的数组]}
-->
<template>
    <div class="wepy_checkbox-group" :id="id">
        <slot></slot>
    </div>
</template>
<script>
import { uuid } from '../helper/util';

export default {
    name: 'checkbox-group',

    data () {
        return {
            id: `checkbox-${uuid()}`
        };
    }
}
</script>
