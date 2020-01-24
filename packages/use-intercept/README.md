# @wepy/use-intercept

 weapp APIs intercept factory.

## Install 

```
npm install @wepy/use-intercept --save
```

## Usage


### Basic Usage

```
import wepy from '@wepy/core';
import useIntercept  from '@wepy/use-intercept';

wepy.use(useIntercept);

const request = wepy.intercept(wepy.wx.request, {
  config(params) {
    console.log(params);
    params.t = +new Date();
    return params;
    // return Promise.resolve(params); // support async config interceptor
  },
  success(res) {
    console.log(res);
  },
  fail(e) {
    console.log(e);
  }
})
```

