# wepy define plugin

## Install

```bash
npm install @wepy/plugin-define --save-dev
```

## Config `wepy.config.js`

```javascript
const DefinePlugin = require('@wepy/plugin-define');

module.exports = {
  plugins: [
    DefinePlugin({
      BASE_URL: JSON.stringify('http://foobar.com'),
      'process.env.NODE_ENV': 'development',
      'typeof window': JSON.stringify('undefined'),
      DEV: true
    })
  ]
};
```

## Reference
[webpack.DefinePlugin](https://webpack.js.org/plugins/define-plugin/)



