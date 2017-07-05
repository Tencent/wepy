# wepy typescript 编译器

## 安装

```
npm install wepy-compiler-typescript --save-dev
```

## 配置`wepy.config.js`

```
module.exports = {
    "compilers": {
        typescript: {
            "compilerOptions": {
                "module": "system"
            }
        }
    }
};
```

## 参数说明

[TypeScript](https://www.tslang.cn/docs/home.html)