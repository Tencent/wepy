# wepy 中使用async/await

## 安装

```
npm install wepy-async-function --save
```

## 引用

```
// app.wpy
import wepy from 'wepy';

import 'wepy-async-function';
```

## 配置`wepy.config.js`编译器

```
module.exports = {
    'compilers': {
        babel: {
            'presets': [
                'es2015',
                'stage-1'
            ],
            'plugins': [
                'transform-export-extensions',
                'syntax-export-extensions'
            ]
        }
    }
};
```

