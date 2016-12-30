# wepy 图片压缩插件


## 安装

```
npm install wepy-plugin-imagemin --save-dev
```

## 配置`wepy.config.js`

```
module.exports.plugins = {
    'imagemin': {
        filter: /\.(jpg|png|jpge)$/,
        config: {
            'jpg': {
                quality: 80
            },
            'png': {
                quality: 80
            }
        }
    }
};
```


## 参数说明

[imagemin](https://github.com/imagemin/imagemin)