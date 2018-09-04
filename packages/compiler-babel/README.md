# wepy babel 编译器

## 安装

```
npm install wepy-compiler-babel --save-dev
```

## 配置`wepy.config.js`

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

## 参数说明

[Babel](https://github.com/babel/babel)