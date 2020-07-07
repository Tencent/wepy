# @wepy/use-intercept

 weapp APIs intercept factory.

## 安装 

```
npm install @wepy/use-intercept --save
```

## 用法


### 基本用法

```
import wepy from '@wepy/core';
import useIntercept  from '@wepy/use-intercept';

wepy.use(useIntercept);

const request = wepy.intercept(wepy.wx.request, {
  config(params) {
    console.log(params);
    if (!params.data) {
      params.data = {};
    }
    params.data.t = +new Date();
    return params;
    // return Promise.resolve(params); // support async config interceptor
  },
  success(res) {
    console.log(res);
    return res;
  },
  fail(e) {
    console.log(e);
    return e;
  }
})
```

