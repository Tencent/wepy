# wepy babel 编译器
# wepy babel compiler

## 安装
## Install

```
npm install @wepy/compiler-babel --save-dev
```

## 配置`wepy.config.js`
## Configure `wepy.config.js`


```
module.exports = {
    "compilers": {
        babel: {
            'presets': [
                'es2015',
                'stage-1'
            ],
            'plugins': [
                'transform-export-extensions',
                'syntax-export-extensions',
                'transform-runtime'
            ]
        }
    }
};
```

## Parameter Description
## 参数说明

## Parameter Description
[Babel](https://github.com/babel/babel)