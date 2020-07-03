# @wepy/babel-plugin-import-regenerator

允许wepy使用 `Async Functions`.

## 安装

```
# Install regenerator-runtime dependence
$ npm install regenerator-runtime --save

# Install babel plugin 
$ npm install @wepy/babel-plugin-import-regenerator --save-dev
```

## 用法

在您的wepy.config.js中放入一下内容:


```js

{
  ....
    compilers: {
      babel: {
        presets: [
          '@babel/preset-env'
        ],
        plugins: [
          '@wepy/babel-plugin-import-regenerator'
        ]
      }
    }
}
```

## 执照

MIT
