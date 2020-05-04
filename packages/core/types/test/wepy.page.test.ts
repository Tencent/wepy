import wepy from '../index';


wepy.page({
  hooks: {
    'hi' : function (v: number) {
      console.log(this);
    },
    'before-setData': function (dirty: object): object {
      console.log('setData dirty: ', dirty);
      return dirty;
    }
  },
  
  created() {
    console.log(this);
  },

  data: {
    d: 'string'
  },

  onLoad (option) {
    console.log(option);
    this.sleep(10);
  },

  onShow() {

  }, 
  
  onPageScroll () {

  },

  onReachBottom () {

  },

  onPullDownRefresh () {

  },
  onShareAppMessage (): Page.ICustomShareContent {
    return <Page.ICustomShareContent>{
      title: 'share title',
      imageUrl: 'http://www.baidu.com',
      path: '/a/b/c'
    }
  },

  methods: {
    bindtap () {
    },

    sleep (s: number) {
      console.log(this.testAsync);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('promise resolved')
        }, s * 1000)
      })
    },

    async testAsync () {
      console.log(this);
      let d = await this.sleep(3);
    }
  }
});