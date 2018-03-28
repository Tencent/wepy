# wepy postcss 编译器

## 安装

```
npm install wepy-compiler-postcss --save-dev
```


## 配置 `wepy.config.js` ,以使用 `cssnext` 为例

```
const cssnext = require('cssnext);

module.exports = {
    "compilers": {
        postcss: {
            plugins: [
                cssnext({
                    browsers:['iOS 9', 'Android 4.4']
                })
            ]
        },
    }
};
```

## 参数说明

[PostCSS及其常用插件介绍](http://www.css88.com/archives/7317)


## 已知Bug

使用`cssnano`插件压缩css时，由于其依赖`macaddress`存在全局变量泄露问题，将导致无法完成编译过程。
问题相关：[Github](https://github.com/webpack-contrib/css-loader/pull/472)

如果你有相关解决办法请联系我 shoyuf@shoyuf.top