# wepy postcss 编译器
# wepy postcss compiler

## 安装
## Install

```
npm install @wepy/compiler-postcss --save
```


## 配置 `wepy.config.js` ,以使用 `cssnext` 为例
## Configure `wepy.config.js`, take `cssnext` as an example

```
const cssnext = require('cssnext');

module.exports = {
    "compilers": {
        postcss: {
            plugins: [
                cssnext({
                    browsers:['iOS 9', 'Android 4.4']
                })
            ],
            map: {
                inline: true
            }
        },
    }
};
```

## 参数说明

配置参数为[processOptions](http://api.postcss.org/global.html#processOptions)及[plugins](http://api.postcss.org/global.html#Plugin)

## Parameter Description
The configuration parameters are [processOptions](http://api.postcss.org/global.html#processOptions) and [plugins](http://api.postcss.org/global.html#Plugin)


## 已知Bug

使用`cssnano`插件压缩css时，由于其依赖`macaddress`存在全局变量泄露问题，将导致无法完成编译过程。
问题相关：[Github](https://github.com/webpack-contrib/css-loader/pull/472)

## Known bugs

When using the `cssnano` plugin to compress css, due to the global variable leakage problem of its dependence on `macaddress`, the compilation process cannot be completed.
Issue related: [Github](https://github.com/webpack-contrib/css-loader/pull/472)

## Contributor

[](salehsami017@gmail.com)
[fsy0718](mailto:fsy0718@gmail.com)
