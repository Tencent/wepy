<!--
@author: dlhandsome
@description: 小程序表单组件checkbox
@link: https://mp.weixin.qq.com/debug/wxadoc/dev/component/checkbox.html

@properties:
value	String		<checkbox/>标识，选中时触发<checkbox-group/>的 change 事件，并携带 <checkbox/> 的 value
disabled	Boolean	false	是否禁用
checked	Boolean	false	当前是否选中，可用来设置默认选中
color	Color		checkbox的颜色，同css的color
-->
<template>
    <div class="wepy_checkbox">
        <input type="checkbox" :name="checkboxName" :checked="checked" :disabled="disabled" :value="value" @change="change">
        <i class="wepy_icon" :style="{color: color}"></i>
    </div>
</template>
<script>

export default {
    name: 'checkbox',

    data () {
        return {
            checkboxName: 'checkbox'
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
        getCheckboxValue () {
            const $checkboxLists = document.getElementsByName(this.checkboxName);
            const checkboxValue = [];

            [].slice.call($checkboxLists).forEach($checkbox => {
                if ($checkbox.checked) checkboxValue.push($checkbox.value);
            });
            return checkboxValue;
        },
        change (e) {
            e.stopPropagation();

            this.$dispatch('change', {
                type: 'change',
                detail: {
                    value: this.getCheckboxValue()
                },
                currentTarget: this.$el
            });
        }
    },

    ready () {
        if (this.$parent.$el.classList.contains('wepy_checkbox-group')) {
            this.checkboxName = this.$parent.$el.id;
        }
    }
}
</script>

<style lang="less">
@import "styles/mixin/icon-font.less";

.wepy_checkbox{
    display: inline-block;
}
.wepy_checkbox input{
    position: absolute;
    left: -9999em;
}
.wepy_checkbox .wepy_icon:before {
    color: #C9C9C9;
    content: '';
    font-size: 13px;
    display: block;
    width: 13px;
    height: 13px;
    padding: 4px;
    border: 1px solid #C9C9C9;
    border-radius: 2px;
    margin: 0 .354em;
}
.wepy_checkbox input:checked + .wepy_icon:before {
    color: #09BB07;
    content: '\EA08';
}
</style>
