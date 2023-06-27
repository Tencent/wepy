[English](./README_EN.md) | [简体中文]

# @wepy/babel-plugin-import-regenerator

允许wepy使用
Allow wepy to use

 `Async Functions`.

## 安装  Install

```
# Install regenerator-runtime dependence
$ npm install regenerator-runtime --save

# Install babel plugin 
$ npm install @wepy/babel-plugin-import-regenerator --save-dev
```

## 用法  usage

在 wepy.config.js 中放入以下内容:
Put the following in wepy.config.js:


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

## License

MIT
