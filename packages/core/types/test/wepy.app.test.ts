import wepy from '../index';

wepy.app({
  hooks: {
    'before-setData': function (data) {
      data.item = 1;
      return data;
    }
  },

  onLaunch(option) {
    if (option) console.log(option.query);
  },

  onError(e) {
    console.log(e);
  }
});
