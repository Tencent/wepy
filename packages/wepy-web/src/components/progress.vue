<template>
    <div class="wepy_progress">
      <div class="wepy_progress-bar" :style="_barStyle">
        <div class="wepy_progress-inner_bar" :style="_innerBarStyle"></div>
      </div>
      <div v-show="_showInfo" class="wepy_progress-percent">{{ _percent + '%' }}</div>
    </div>
</template>

<script>
  import helper from '@/helper'
  /**
   * check props
   * @type {{percent: (())}}
   */
  const valid = {
    percent (v) {
      return v >= 0 && v <= 100
    }
  }

  const props = {
    'percent': {
      type: Number,
      default: 0,
      validator (v) {
        return valid.percent(v)
      }
    },
    'showInfo': {
      type: Boolean,
      default: false
    },
    'strokeWidth': {
      type: Number,
      default: 6
    },
    'color': {
      type: String,
      default: '#09BB07'
    },
    'activeColor': {
      type: String,
      default: ''
    },
    'backgroundColor': {
      type: String,
      default: ''
    },
    'active': {
      type: Boolean,
      default: false
    }
  }

  /**
   * 优先级：activeColor > color ，两者均为进度条颜色字段
   */

  export default {
    name: 'progress',

    props,

    computed: {
      _percent () {
        const { percent } = props
        return helper.typePolyfill(percent, this.percent)
      },
      _strokeWidth () {
        const { strokeWidth } = props
        return helper.typePolyfill(strokeWidth, this.strokeWidth)
      },
      _showInfo () {
        return this.showInfo
      },
      _barStyle () {
        return {
          height: `${this._strokeWidth}px`,
          backgroundColor: this.backgroundColor
        }
      },
      _innerBarStyle () {
        return {
          backgroundColor: this.activeColor || this.color,
          width: `${this._percent}%`
        }
      }
    }
  }
</script>

<style scroped>
  .wepy_progress{
    display: -webkit-box;
    display: -webkit-flex;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    align-items: center;
  }
  .wepy_progress-bar{
    background-color: #EBEBEB;
    height: 6px;
    -webkit-box-flex: 1;
    -webkit-flex: 1;
    flex: 1;
  }
  .wepy_progress-inner_bar{
    width: 0;
    height: 100%;
    background-color: #09BB07;
  }
  .wepy_progress-percent{
    font-size: 16px;
    margin-left: 15px;
  }
</style>
