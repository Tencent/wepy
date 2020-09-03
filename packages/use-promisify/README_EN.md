English | [简体中文](./README.md)

# @wepy/use-promisify

Promisfy all weapp APIs.

## Install 

```
npm install @wepy/use-promisify --save
```

## Usage


### Basic Usage

```
import wepy from '@wepy/core';
import promisify  from '@wepy/use-promisify';

wepy.use(promisify);

wepy.wx.getStorage('mykey').then(res => console.log(res));
```

### Ignore APIs

```
wepy.use(promisify, ['getStorage', 'getSystemInfo']);

// passing object
// wepy.use(promisify, { someNewAPI: false, getStorage: true });
wepy.wx.getStorage({
  key: 'mykey',
  succuess (res) { console.log(res) }
})
```

### Function call

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

Supports all function which is weapp-style:

```
func({
  success () {},
  fail () {}
})
wepy.promisify(func)({key: 'mykey'}).then(console.log).catch(console.error);
```

#### error-first

Supports all `error-first` functions, like:

```
func(arg1, args2, function (err, data) {});

wepy.promisify(func, null, 'error-first')(arg1, arg2).then(console.log).catch(console.error);
```


### Simplify Parameters

`weapp-style` function always need a Object params, and this plugin will simplify the parameters. e.g.

```
wepy.use(promisify);

// wepy.wx.getStorage({ key: 'mykey' });
wepy.wx.getStorage('mykey');

// wepy.wx.request({ url: myurl });
wepy.wx.request(myurl);

// wepy.wx.openLocation({ latitude: 0, longitude: 0 });
wepy.wx.openLocation(0, 0);
```

Here we can see all the [Simplify List](https://github.com/Tencent/wepy/blob/2.0.x/packages/use-promisify/index.js#L86-L152) 
