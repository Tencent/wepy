# wepy 文件压缩插件

支持文本替换

## 安装

```
npm install wepy-plugin-replace --save-dev
```

## 配置`wepy.config.js`

为 plugins 添加 replace 对象，支持单个或者多个规则，多个规则可以以 Array 或者 Object 实现，filter 的对象为生成后文件的路径， 例如'dist/app.js'，每个规则也同时支持多个替换条目，同样是以 Array 或者 Object 实现。

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


module.exports.plugins = {
    'replace': [{
        filter: /moment\.js$/,
        config: {
            find: /([\w\[\]a-d\.]+)\s*instanceof Function/g,
            replace: function (matchs, word) {
                return ' typeof ' + word + " ==='function' ";
            }
        }
    }, {
        filter: /anotherfile\.js$/,
        config: [{
            find: 'hello world',
            replace: 'hello wepy'
        },{
            find: 'hello world2',
            replace: 'hello wepy2'
        }]
    }]
};

module.exports.plugins = {
    'replace': {
        'fix-moment': {
            filter: /moment\.js$/,
            config: {
                find: /([\w\[\]a-d\.]+)\s*instanceof Function/g,
                replace: function (matchs, word) {
                    return ' typeof ' + word + " ==='function' ";
                }
            }
        }, 
        'fix-other': {
            filter: /anotherfile\.js$/,
            config: {
                rule1: {
                    find: 'hello world',
                    replace: 'hello wepy'
                },
                rule2: {
                    find: 'hello world',
                    replace: 'hello wepy'
                }
            }
        }
    }
};
```
