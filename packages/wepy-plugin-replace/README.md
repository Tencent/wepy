# wepy 文件压缩插件

支持文本替换

## 安装

```
npm install wepy-plugin-replace --save-dev
```

## 配置`wepy.config.js`

```
module.exports.plugins = {
    'replace': {
        filter: /moment\.js$/,
        config: {
            find: /([\w\[\]a-d\.]+)\s*instanceof Function/g,
            replace: function (matchs, word) {
                return ' typeof ' + word + " ==='function' ";
            }
        }
    }
};

```