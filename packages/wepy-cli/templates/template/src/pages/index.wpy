<style lang="less">
  .userinfo {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .userinfo-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
  }

  .userinfo-nickname {
    color: #aaa;
  }
</style>
<template>
  <view class="container">
    <view class="userinfo" @tap="handleViewTap">
      <image class="userinfo-avatar" src="{{ userInfo.avatarUrl }}" background-size="cover"/>
      <view class="userinfo-nickname">{{ userInfo.nickName }}</view>
    </view>

    <panel>
      <view class="title" slot="title">测试数据绑定</view>

      <text class="info">{{normalTitle}}</text>
      <text class="info">{{setTimeoutTitle}}</text>
      <text class="info">{{mixin}}</text>
      <text class="info">{{mynum}}</text>
      <text class="info">{{now}}</text>
      <button @tap="plus('a')" size="mini">  +  </button>
    </panel>

    <panel>
      <view class="title" slot="title">其它测试</view>
      <button @tap="toast" size="mini">第三方组件</button>
      <button @tap="communicate" size="mini">组件通信</button>
      <button @tap="tap" size="mini">混合TAP事件</button>
    </panel>

    <panel>
      <view class="title" slot="title">测试并发网络请求</view>
      <view>返回结果: <text>{{netrst}}</text></view>
      <button @tap="request" size="mini"> 点我发起10个请求 </button>
    </panel>

    <panel>
      <view class="title" slot="title">测试组件</view>

      <text class="testcounter">计数组件1: </text>
      <view class="counterview">
        <counter1 @index-emit.user="counterEmit" />
      </view>

      <text class="testcounter">计数组件2: </text>

      <view class="counterview">
        <counter2 :num.sync="mynum"></counter2>
      </view>
    </panel>

    <panel>
      <view class="title" slot="title">测试组件Repeat</view>
      <repeat for="{{groupList}}" index="index" item="item" key="key">
        <group :grouplist="item" :indexa="index"></group>
      </repeat>
    </panel>

    <panel>
      <view class="title" slot="title">测试列表</view>
      <list></list>
    </panel>

    <toast />
  </view>
</template>

<script>
  import wepy from 'wepy'
  import List from '../components/list'
  import Panel from '../components/panel'
  import Counter from 'counter' // alias example
  import Group from '../components/group'
  import Toast from 'wepy-com-toast'
  import testMixin from '../mixins/test'

  export default class Index extends wepy.page {
    config = {
      navigationBarTitleText: 'test'
    }
    components = {
      panel: Panel,
      counter1: Counter,
      counter2: Counter,
      list: List,
      group: Group,
      toast: Toast
    }

    mixins = [testMixin]

    data = {
      mynum: 20,
      userInfo: {
        nickName: '加载中...'
      },
      normalTitle: '原始标题',
      setTimeoutTitle: '标题三秒后会被修改',
      count: 0,
      netrst: '',
      groupList: [
        {
          id: 1,
          name: '点击改变',
          list: [
            {
              childid: '1.1',
              childname: '子项，点我改变'
            }, {
              childid: '1.2',
              childname: '子项，点我改变'
            }, {
              childid: '1.3',
              childname: '子项，点我改变'
            }
          ]
        },
        {
          id: 2,
          name: '点击改变',
          list: [
            {
              childid: '2.1',
              childname: '子项，点我改变'
            }, {
              childid: '2.2',
              childname: '子项，点我改变'
            }, {
              childid: '2.3',
              childname: '子项，点我改变'
            }
          ]
        },
        {
          id: 3,
          name: '点击改变',
          list: [
            {
              childid: '3.1',
              childname: '子项，点我改变'
            }
          ]
        }
      ]
    }

    computed = {
      now () {
        return +new Date()
      }
    }

    methods = {
      plus () {
        this.mynum++
      },
      toast () {
        let promise = this.$invoke('toast', 'show', {
          title: '自定义标题',
          img: 'https://raw.githubusercontent.com/kiinlam/wetoast/master/images/star.png'
        })

        promise.then((d) => {
          console.log('toast done')
        })
      },
      tap () {
        console.log('do noting from ' + this.$name)
      },
      communicate () {
        console.log(this.$name + ' tap')

        this.$invoke('counter2', 'minus', 45, 6)
        this.$invoke('counter1', 'plus', 45, 6)

        this.$broadcast('index-broadcast', 1, 3, 4)
      },
      request () {
        let self = this
        let i = 10
        let map = ['MA==', 'MQo=', 'Mg==', 'Mw==', 'NA==', 'NQ==', 'Ng==', 'Nw==', 'OA==', 'OQ==']
        while (i--) {
          wepy.request({
            url: 'https://www.madcoder.cn/tests/sleep.php?time=1&t=css&c=' + map[i] + '&i=' + i,
            success: function (d) {
              self.netrst += d.data + '.'
              self.$apply()
            }
          })
        }
      },
      counterEmit (...args) {
        let $event = args[args.length - 1]
        console.log(`${this.$name} receive ${$event.name} from ${$event.source.$name}`)
      }
    }

    events = {
      'index-emit': (...args) => {
        let $event = args[args.length - 1]
        console.log(`${this.$name} receive ${$event.name} from ${$event.source.$name}`)
      }
    }

    onLoad() {
      let self = this
      this.$parent.getUserInfo(function (userInfo) {
        if (userInfo) {
          self.userInfo = userInfo
        }
        self.normalTitle = '标题已被修改'

        self.setTimeoutTitle = '标题三秒后会被修改'
        setTimeout(() => {
          self.setTimeoutTitle = '到三秒了'
          self.$apply()
        }, 3000)

        self.$apply()
      })
    }
  }
</script>
