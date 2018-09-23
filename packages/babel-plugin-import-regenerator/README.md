# @wepy/babel-plugin-import-regenerator

Allow wepy to use `Async Functions`.

## Installation

```
# Install regenerator-runtime dependence
$ npm install regenerator-runtime --save

# Install babel plugin 
$ npm install @wepy/babel-plugin-import-regenerator --save-dev
```

## Usage

Put something like this in your wepy.config.js:


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
