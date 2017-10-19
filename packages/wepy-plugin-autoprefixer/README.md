# wepy框架autoprefixer插件

## 安装

```
npm install wepy-plugin-autoprefixer --save-dev
```

## 配置`wepy.config.js`

```
module.exports.plugins = {
    'autoprefixer': {
        filter: /\.wxss$/,
        config: {
          browsers: ['last 11 iOS versions']
        }
    },
};
```


## 参数说明 

[autoprefixer](https://github.com/postcss/autoprefixer#options)