<!--
@author: dlhandsome
@description: 小程序基础组件text
@link: https://mp.weixin.qq.com/debug/wxadoc/dev/component/text.html

@properties:
selectable	Boolean	false	文本是否可选	1.1.0
-->
<template>
  <span class="wepy_text" :style="style">
    <slot></slot>
  </span>
</template>

<script>

export default {
    name: 'text',

    props: {
        'selectable': {
            type: Boolean,
            default: false
        }
    },

    computed: {
        style () {
            return {
                userSelect: this.selectable ? 'text' : 'none';
            }
        }
    }
}
</script>
