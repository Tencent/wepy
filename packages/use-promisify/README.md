[English](./README_EN.md) | 简体中文

# @wepy/use-promisify

Promisfy all weapp APIs.

## 安装

```
npm install @wepy/use-promisify --save
```

## 用法


### 基本用法

```
import wepy from '@wepy/core';
import promisify  from '@wepy/use-promisify';

wepy.use(promisify);

wepy.wx.getStorage('mykey').then(res => console.log(res));
```

### 忽略 APIs

```
wepy.use(promisify, ['getStorage', 'getSystemInfo']);

// passing object
// wepy.use(promisify, { someNewAPI: false, getStorage: true });
wepy.wx.getStorage({
  key: 'mykey',
  succuess (res) { console.log(res) }
})
```

### 函数调用

Support to use `wepy.promisify` to promisify a callback function.

```
/**
 * Promisify a callback function
 * @param  {Function} fn     callback function
 * @param  {Object}   caller caller
 * @param  {String}   type   weapp-style|error-first, default to weapp-style
 * @return {Function}        promisified function
 */
wepy.promisify(fn, caller, type);
```

#### weapp-style

支持 weapp-style的所有功能:

```
func({
  success () {},
  fail () {}
})
wepy.promisify(func)({key: 'mykey'}).then(console.log).catch(console.error);
```

#### error-first

支持所有 `error-first` 功能，例如:

```
func(arg1, args2, function (err, data) {});

wepy.promisify(func, null, 'error-first')(arg1, arg2).then(console.log).catch(console.error);
```


### 简化参数

`weapp-style` 函数始终需要一个Object参数，并且此插件将简化参数。例如：

```
wepy.use(promisify);

// wepy.wx.getStorage({ key: 'mykey' });
wepy.wx.getStorage('mykey');

// wepy.wx.request({ url: myurl });
wepy.wx.request(myurl);

// wepy.wx.openLocation({ latitude: 0, longitude: 0 });
wepy.wx.openLocation(0, 0);
```

在这里我们可以看到所有的简化列表 [Simplify List](https://github.com/Tencent/wepy/blob/2.0.x/packages/use-promisify/index.js#L86-L152) 