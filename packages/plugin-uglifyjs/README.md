# wepy uglifyjs 插件

## 安装

```bash
npm install @wepy/plugin-uglifyjs uglify-js --save-dev
```

## 配置`wepy.config.js`

```javascript
const PluginUglifyjs = require('@wepy/plugin-uglifyjs');

module.exports = {
  plugins: [
    PluginUglifyjs({
    // options
    })
  ]
};
```

## 参数说明

你提供的配置选项 ```options``` 将传递给 ```UglifyJS```处理，有关 ```options``` 的更多详细信息，请参阅[UglifyJS文档](https://github.com/mishoo/UglifyJS2#minify-options)。


