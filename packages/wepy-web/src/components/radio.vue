<!--
@author: dlhandsome
@description: 小程序表单组件radio
@link: https://mp.weixin.qq.com/debug/wxadoc/dev/component/radio.html

@properties:
value	String		<radio/> 标识。当该<radio/> 选中时，<radio-group/> 的 change 事件会携带<radio/>的value
checked	Boolean	false	当前是否选中
disabled	Boolean	false	是否禁用
color	Color		radio的颜色，同css的color
-->
<template>
    <div class="wepy_radio">
        <input type="radio" :name="radioName" :checked="checked" :disabled="disabled" :value="value" @change="change">
        <i class="wepy_icon" :style="{color: color}"></i>
    </div>
</template>
<script>

export default {
  name: 'radio',

  data () {
      return {
          radioName: 'radio'
      };
  },

  props: {
      value: {
          type: String,
          default: ''
      },
      checked: {
          type: Boolean,
          default: false
      },
      disabled: {
          type: Boolean,
          default: false
      },
      color: {
          type: String,
          default: ''
      }
  },

  methods: {
      change (e) {
          e.stopPropagation();

          this.$dispatch('change', {
              type: 'change',
              detail: {
                  value: this.value
              },
              currentTarget: this.$el
          });
      }
  },

  ready () {
      if (this.$parent.$el.classList.contains('wepy_radio-group')) {
          this.radioName = this.$parent.$el.id;
      }
  }
}
</script>

<style lang="less">
@import "styles/mixin/icon-font.less";

.wepy_radio{
  display: inline-block;
}
.wepy_radio input{
  position: absolute;
  left: -9999em;
}
.wepy_radio .wepy_icon:before {
  color: #C9C9C9;
  content: '\EA01';
  font-size: 23px;
  display: block;
}
.wepy_radio input:checked + .wepy_icon:before {
  color: #09BB07;
  content: '\EA06';
}
</style>
