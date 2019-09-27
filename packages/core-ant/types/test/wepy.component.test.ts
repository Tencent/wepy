import wepy from '../index';


wepy.component({

  relations: {
    './child': {
      type: ''
    }
  },
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
    this.initData();
  },

  data: {
    d: 'string'
  },

  onLoad (option) {
    console.log(option);
  },

  onShow() {

  }, 
  
  methods: {
    bindtap () {
    },

    initData () {
      wx.request({
        method: 'POST',
        url: 'http://www.baidu.com'
      })
    }
  }
});