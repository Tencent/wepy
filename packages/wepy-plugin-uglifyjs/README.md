# wepy JS压缩插件

## 安装

```
npm install wepy-plugin-uglifyjs --save-dev
```

## 配置`wepy.config.js`

```
module.exports.plugins = {
    'uglifyjs': {
        filter: /\.js$/,
        exclude: [
            'project',
            /test/,
        ],// 每一项可以为字符串或者正则表达式
        config: {
        }
    },
};
```


## 参数说明

[UglifyJS](https://github.com/mishoo/UglifyJS2)