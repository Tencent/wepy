# wepy sass 编译器

## 安装

```
npm install @wepy/compiler-sass --save-dev
```

## 配置`wepy.config.js`

```
module.exports = {
    "compilers": {
        sass: {
            'outputStyle': 'compressed'
        }
    }
};
```


## 参数说明

[node-sass](https://github.com/sass/node-sass)